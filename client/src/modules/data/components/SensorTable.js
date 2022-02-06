import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getPastTimestamp, formatTimestamp } from 'lib/utils';
import TimestampContext from 'modules/app/components/TimestampContext';
import sensorConfig from 'modules/data/sensorConfig';
import environment from 'modules/relay/environment';

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

const ReactTable = React.memo(({ data }) => {
  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <TableContainer sx={{ maxHeight: '80vh' }}>
      <Table {...getTableProps()} sx={{ m: 2 }} stickyHeader>
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
    </TableContainer>
  );
});

const SensorTable = () => {
  const timestamp = React.useContext(TimestampContext);
  const params = useParams();

  const sensorName = React.useMemo(
    () => sensorConfig.find(({ id }) => id === params.id)?.name,
    [params.id],
  );

  const [start, setStart] = React.useState(
    getPastTimestamp(30, 'minutes', { startFrom: timestamp }),
  );

  React.useEffect(() => {
    setStart(getPastTimestamp(30, 'minutes', { startFrom: timestamp }));
  }, [timestamp]);

  const renderQuery = React.useCallback(({ error, props: relayProps }) => {
    if (error) {
      return error.message;
    }

    if (Array.isArray(relayProps?.data)) {
      return <ReactTable data={relayProps.data} />;
    }

    return null;
  }, []);

  return (
    <>
      <Typography variant="h6" sx={{ m: 2, width: '100%', textAlign: 'center' }}>
        {sensorName}
      </Typography>
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
    </>
  );
};

export default React.memo(SensorTable);
