// src/components/VideoTrimmer.jsx
import React, { useEffect, useRef, useState } from "react";
import RecordRTC from "recordrtc";
import { toast } from "react-toastify";

export default function VideoTrimmer({ file, onTrimComplete, onCancel, maxDuration = 18, type }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const v = videoRef.current;
    v.src = url;

    const handleLoaded = () => {
      setDuration(v.duration || 0);
      setEnd(v.duration || 0);
    };
    const handleTime = () => setCurrent(v.currentTime);

    v.addEventListener("loadedmetadata", handleLoaded);
    v.addEventListener("timeupdate", handleTime);

    return () => {
      v.removeEventListener("loadedmetadata", handleLoaded);
      v.removeEventListener("timeupdate", handleTime);
      v.pause();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const formatTime = (t = 0) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const applyTrim = async () => {
    if (!file) return;
    if (start >= end) {
      toast.error("Start time must be less than end time");
      return;
    }

    if (end - start > maxDuration) {
      const msg =
        maxDuration < 60
          ? `Trimmed video cannot exceed ${maxDuration} seconds`
          : `Trimmed video cannot exceed ${Math.floor(maxDuration / 60)} minutes`;
      toast.error(msg);
      return;
    }

    setIsTrimming(true);
    try {
      const video = document.createElement("video");
      video.muted = true; // avoid autoplay block
      video.src = URL.createObjectURL(file);

      await new Promise((res) =>
        video.addEventListener("loadedmetadata", () => res(), { once: true })
      );

      // setup canvas
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      // capture canvas stream (video)
      const stream = canvas.captureStream(30);

      // merge audio from video
      const audioStream = video.captureStream();
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      // pick safe mimeType depending on browser
      // let mimeType;
      // let ext;
      // if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
      //   // Safari only → H.264 MP4
      //   mimeType = "video/mp4;codecs=h264,aac";
      //   ext = "mp4";
      // } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      //   mimeType = "video/webm;codecs=vp9,opus";
      //   ext = "webm";
      // } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      //   mimeType = "video/webm;codecs=vp8,opus";
      //   ext = "webm";
      // } else {
      //   mimeType = "video/webm";
      //   ext = "webm";
      // }
      // ✅ Try MP4 first, fallback to WebM if unsupported
      let mimeType = "video/mp4;codecs=h264,aac";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8,opus";
      }

      const recorder = new RecordRTC(stream, {
        type: "video",
        mimeType,
        disableLogs: true,
      });

      recorder.startRecording();


      // draw frames
      let rafId = null;
      const draw = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch { }
        rafId = requestAnimationFrame(draw);
      };

      // seek to start
      video.currentTime = start;
      await new Promise((resolve) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          resolve();
        };
        video.addEventListener("seeked", onSeek);
      });

      draw();
      await video.play();

      const onTimeUpdate = () => {
        if (video.currentTime >= end || video.ended) {
          video.pause();
          video.removeEventListener("timeupdate", onTimeUpdate);
          cancelAnimationFrame(rafId);

          // recorder.stopRecording(() => {
          //   const blob = recorder.getBlob();

          //   // ✅ fix invalid file type
          //   // const safeType =
          //   //   blob.type && blob.type.startsWith("video/") ? blob.type : "video/webm";

          //   // const baseName = (file.name || "video").replace(/\.[^/.]+$/, "");
          //   // const trimmedFile = new File([blob], `${baseName}_trimmed.webm`, {
          //   //   type: safeType,
          //   // });

          //   const trimmedFile = new File([blob], "trimmed.webm", {
          //     type: "video/webm"
          //   });

          //   setIsTrimming(false);
          //   onTrimComplete(trimmedFile);

          //   try {
          //     URL.revokeObjectURL(video.src);
          //   } catch { }
          // });

          recorder.stopRecording(() => {
            const blob = recorder.getBlob();

            const baseName = (file.name || "video").replace(/\.[^/.]+$/, "");
            const trimmedFile = new File([blob], `${baseName}_trimmed.mp4`, {
              type: "video/mp4",
            });

            setIsTrimming(false);
            onTrimComplete(trimmedFile);

            try {
              URL.revokeObjectURL(video.src);
            } catch { }
          });

        }
      };

      video.addEventListener("timeupdate", onTimeUpdate);
    } catch (err) {
      console.error("Trim failed:", err);
      toast.error("Trimming failed");
      setIsTrimming(false);
    }
  };

  if (!file) return null;

  return (
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.modal}>
        <h5 style={{ marginBottom: 10 }}>Trim Video</h5>
        <div style={{ width: "100%" }}>
          <video
            ref={videoRef}
            controls
            disablePictureInPicture

            controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"

            style={{ width: "100%", maxHeight: 320, background: "#000" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <small>Current: {formatTime(current)}</small>
            <small>
              Selected: {formatTime(start)} — {formatTime(end)} ( / {formatTime(duration)})
            </small>
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", fontSize: 13 }}>Start (seconds)</label>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={start}
              onChange={(e) => setStart(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
            <label style={{ display: "block", fontSize: 13, marginTop: 6 }}>End (seconds)</label>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={end}
              onChange={(e) => setEnd(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={applyTrim}
                disabled={
                  isTrimming ||
                  start >= end ||
                  end - start <= 0 || // prevent 0 or negative duration
                  end - start > maxDuration
                }
              >
                {isTrimming
                  ? "Trimming..."
                  : end - start > maxDuration
                    ? `Trim must be ≤ ${type === "story" ? "18s" : "3 minutes"}`
                    : "Apply Trim"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
  },
  modal: {
    width: "720px",
    maxWidth: "95%",
    background: "#fff",
    padding: 16,
    borderRadius: 8,
  },
};
