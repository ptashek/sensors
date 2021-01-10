import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { formatTimestamp } from 'lib/utils';
import ContentWrapper from 'modules/app/components/ContentWrapper';

const StyledLink = React.memo((props) => {
  const { children, ...linkProps } = props;

  return (
    <Link {...linkProps} color="primary" variant="body2">
      <strong>{children}</strong>
    </Link>
  );
});

const SensorData = React.memo((props) => {
  const { sensor, title, ts, children } = props;
  const history = useHistory();
  const dateString = formatTimestamp(ts);

  const onClick = () => history.replace(`/sensor/${sensor}`);

  return (
    <ContentWrapper>
      <Typography variant="h6" align="center">
        <strong>{title}</strong>
      </Typography>
      <Typography variant="body1" align="center">
        <strong>{dateString}</strong>
      </Typography>
      <hr />
      {children}
      <hr />
      <Grid container spacing={2}>
        <Grid item>
          <StyledLink href={`/#/sensor/${sensor}/chart`}>Chart</StyledLink>
        </Grid>
        <Grid item>
          <StyledLink href={`/#/sensor/${sensor}/table`}>Table</StyledLink>
        </Grid>
      </Grid>
    </ContentWrapper>
  );
});

export default SensorData;
