import React from 'react';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  trendArrow: {
    marginLeft: theme.spacing(0.5),
    fontSize: theme.typography.pxToRem(18),
    color: theme.palette.colors.blueberry400,
    display: 'inline-block',
    textAlign: 'center',
    transition: 'transform 300ms ease-in-out',
  },
  trendSteady: {
    transform: 'rotate(0deg)',
  },
  trendUp: {
    transform: 'rotate(-45deg)',
  },
  trendDown: {
    transform: 'rotate(45deg)',
  },
}));

const TrendArrow = React.memo(({ trend }) => {
  const classes = useStyles();

  return (
    <strong
      className={classnames(classes.trendArrow, {
        [classes.trendSteady]: trend === 0,
        [classes.trendUp]: trend > 0,
        [classes.trendDown]: trend < 0,
      })}
    >
      ↦
    </strong>
  );
});

export default TrendArrow;
