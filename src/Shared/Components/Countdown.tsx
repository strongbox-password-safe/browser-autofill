import { CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Utils } from '../../Utils';

interface CountdownProps {
  seconds: number;
  onLoop: () => void;
}

const Countdown = (props: CountdownProps) => {
  const { seconds, onLoop } = props;
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount(prevCount => prevCount - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (count < 0) {
      setCount(seconds);
      onLoop();
    }
  }, [count]);

  const percentage = Math.floor((count / seconds) * 100);

  return <CircularProgress style={{ color: Utils.getEntropyColor(percentage) }} variant="determinate" value={percentage} />;
};

export default Countdown;
