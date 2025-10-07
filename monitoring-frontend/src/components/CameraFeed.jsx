'use client';

export default function CameraFeed({ src, overlay, title }) {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="relative pb-[56.25%]">{/* 16:9 */}
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={src}
          title={title || 'Camera Feed'}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        {overlay && (
          <div className="absolute inset-0 pointer-events-none">
            {overlay}
          </div>
        )}
      </div>
    </div>
  );
}


