import React from 'react';

import Markdown from 'react-markdown';
import gfm from 'remark-gfm';

import { materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface Props {
  text: string;
}

function CustomMarkDown(props: Props) {
  const { text } = props;

  return (
    <Markdown
      components={{
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');

          return !inline && match ? (
            <SyntaxHighlighter
              style={materialLight}
              PreTag="div"
              language={match[1]}
              children={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code className={className ? className : ''} {...props}>
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[gfm]}
    >
      {text}
    </Markdown>
  );
}

export default CustomMarkDown;
