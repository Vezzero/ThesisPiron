import React from 'react';

export default function HighlightMention({ sentence, mention }) {
  if (!mention) return <>{sentence}</>;

  const escaped = mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = sentence.split(re);

  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <strong style={{textDecoration:"underline"}} key={i}>{part}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
