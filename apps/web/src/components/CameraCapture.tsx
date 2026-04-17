import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  useEffect(() => {
    let active = true;
    setError(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg =
          err instanceof Error ? err.message : "Camera access denied.";
        setError(msg);
      });

    return () => {
      active = false;
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, [facingMode]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        stream?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  function flipCamera() {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      {error ? (
        <p style={{ color: "var(--color-error, #c00)" }}>
          Camera error: {error}
        </p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", maxHeight: "320px", background: "#000", borderRadius: "8px" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="row" style={{ marginTop: "0.75rem", justifyContent: "center" }}>
            <button type="button" className="primary" onClick={capture}>
              Capture
            </button>
            <button type="button" onClick={flipCamera}>
              Flip camera
            </button>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        style={{ marginTop: "0.5rem", width: "100%" }}
      >
        Cancel
      </button>
    </div>
  );
}
