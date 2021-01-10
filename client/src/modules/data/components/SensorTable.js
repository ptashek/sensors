import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { getPastTimestamp, formatTimestamp } from 'lib/utils';
import TimestampContext from 'modules/app/components/TimestampContext';
import ContentWrapper, { Loading } from 'modules/app/components/ContentWrapper';
import environment from 'modules/relay/environment';
import sensorConfig from 'modules/data/sensorConfig';

const useStyles = makeStyles((theme) => ({
  table: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const columns = [
  {
    Header: 'Date/Time',
    id: 'ts',
    accessor: ({ ts }) => formatTimestamp(ts),
    width: 175,
  },
  {
    Header: () => <span>Temp &deg;C</span>,
    id: 'temp_c',
    accessor: ({ temp_c }) => parseFloat(temp_c, 10).toFixed(1),
  },
  {
    Header: () => <span>Dewpoint &deg;C</span>,
    id: 'dewpoint',
    accessor: ({ dewpoint }) => parseFloat(dewpoint, 10).toFixed(1),
  },
  {
    Header: () => <span>Humidity %RH</span>,
    id: 'humidity',
    accessor: ({ humidity }) => parseFloat(humidity, 10).toFixed(1),
  },
  {
    Header: () => <span>Pressure HPa</span>,
    id: 'pressure',
    accessor: ({ pressure }) => parseFloat(pressure, 10).toFixed(0),
  },
];

const ReactTable = React.memo(({ className, data }) => {
  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <Table className={className} {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <TableRow {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});

const SensorTable = React.memo(() => {
  const timestamp = React.useContext(TimestampContext);
  const params = useParams();
  const classes = useStyles();
  const content = React.useRef(null);
  const [start, setStart] = React.useState(
    getPastTimestamp(10, 'minutes', { startFrom: timestamp }),
  );

  React.useEffect(() => {
    setStart(getPastTimestamp(10, 'minutes', { startFrom: timestamp }));
  }, [timestamp]);

  const renderQuery = ({ error, props: relayProps }) => {
    if (error) {
      return <ContentWrapper>{error.message}</ContentWrapper>;
    }

    if (relayProps?.data) {
      content.current = <ReactTable className={classes.table} data={relayProps.data} />;
    }

    return content.current;
  };

  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query SensorTableQuery($sensor: SensorName!, $start: Int!) {
          data: search(sensor: $sensor, start: $start, sortOrder: desc) {
            ts
            temp_c
            dewpoint
            humidity
            pressure
          }
        }
      `}
      variables={{ sensor: params.id, start }}
      render={renderQuery}
    />
  );
});

export default SensorTable;
