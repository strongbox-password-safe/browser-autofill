import React, { useEffect, useState } from 'react';
import { useCustomStyle } from '../../Contexts/CustomStyleContext';
import { Box } from '@mui/material';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';


import SyntaxHighlighter from 'react-syntax-highlighter';

import stackoverflowLight from '../Styles/markdown-styles/stackoverflow-light';

import stackoverflowDark from '../Styles/markdown-styles/stackoverflow-dark';

interface Props {
  text: string;
  onRedirectUrl: (url: string) => void;
}

function CustomMarkDown(props: Props) {
  const { text, onRedirectUrl } = props;
  const { darkMode } = useCustomStyle();
  const [style, setStyle] = useState();

  const onMarkdownClick = (event: any) => {
    event.preventDefault();
    if (event.target && event.target.tagName === 'A') {
      onRedirectUrl(event.target.getAttribute('href'));
    }
  };

  useEffect(() => {
    if (darkMode) {
      setStyle(stackoverflowDark);
    } else {
      setStyle(stackoverflowLight);
    }
  }, [darkMode]);

  return (
    <Box onClick={onMarkdownClick}>
      <article className="markdown-body">
        <Markdown
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter style={style} PreTag="div" language={match[1]} children={String(children).replace(/\n$/, '')} {...props} />
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
      </article>
    </Box>
  );
}

export default CustomMarkDown;
