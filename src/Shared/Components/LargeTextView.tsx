import React from 'react';
import '../Styles/large-text-view.css';
import { ColourPalete, useCustomStyle } from '../../Contexts/CustomStyleContext';
import { GetStatusResponse } from '../../Messaging/Protocol/GetStatusResponse';

interface Props {
  text: string;
  onFillSingleField: (text: string, appendValue: boolean) => Promise<void>;
  status: GetStatusResponse | null;
}

function LargeTextView(props: Props) {
  const { text } = props;
  const { darkMode, convertToColouredChar } = useCustomStyle();
  const textRows = text.match(/.{1,8}/g) || [];

  const resolveColor = (char: string) => {
    if (props.status?.serverSettings.colorizePasswords) {
      if (props.status?.serverSettings.colorBlindPalette) {
        return convertToColouredChar(char, darkMode ? ColourPalete.darkForBlind : ColourPalete.lightForBlind);
      } else {
        return convertToColouredChar(char, darkMode ? ColourPalete.dark : ColourPalete.light);
      }
    } else {
      return '';
    }
  };

  return (
    <div className="grid-container">
      {textRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.split('').map((char, charIndex) => (
            <div
              key={charIndex}
              className="grid-item-hover"
              onClick={() => {
                props.onFillSingleField(char, true);
              }}
            >
              <div style={{ fontSize: '22px', color: resolveColor(char) }}>{char}</div>
              <div style={{ fontSize: '8px', color: 'gray', paddingTop: '5px' }}>{rowIndex * 8 + (charIndex + 1)}</div>
            </div>
          ))}
          {Array.from({ length: 8 - row.length }).map((_, emptyIndex) => (
            <div key={`empty-${emptyIndex}`} className="grid-item empty"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default LargeTextView;
