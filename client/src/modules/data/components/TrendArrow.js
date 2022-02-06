import React from 'react';
import { styled } from '@mui/material/styles';

const Arrow = styled('span')(({ theme, trend }) => ({
  marginLeft: theme.spacing(0.5),
  display: 'inline-block',
  textAlign: 'center',
  transition: 'transform 300ms ease-in-out',
  transform: `rotate(${45 * -trend}deg)`,
}));

const TrendArrow = ({ trend }) => <Arrow trend={trend}>&#10137;</Arrow>;

export default React.memo(TrendArrow);
