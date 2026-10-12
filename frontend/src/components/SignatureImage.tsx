import { useEffect, useState } from 'react';

type SignatureImageProps = { src: string; alt: string; className?: string };

export default function SignatureImage({ src, alt, className }: SignatureImageProps) {
  const [objectUrl, setObjectUrl] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | undefined;
    setObjectUrl(undefined);
    setFailed(false);

    fetch(src, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load signature (${response.status}).`);
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => { if (active) setFailed(true); });

    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [src]);

  if (failed) return <span className="text-xs text-red-500">Unable to load signature</span>;
  if (!objectUrl) return <span className="text-xs text-slate-400">Loading signature…</span>;
  return <img src={objectUrl} alt={alt} className={className} />;
}
