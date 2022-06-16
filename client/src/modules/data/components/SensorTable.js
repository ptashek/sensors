import React, { Suspense } from 'react';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getPastDate, formatDate } from 'lib/dateUtils';
import ReferenceDateContext from 'modules/app/components/ReferenceDateContext';
import SensorSkeleton from 'modules/app/components/SensorSkeleton';
import sensorConfig from 'modules/data/sensorConfig';

const columns = [
  {
    Header: 'Date/Time',
    id: 'dt',
    accessor: ({ dt }) => formatDate(new Date(dt)),
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

const SensorTableQuery = graphql`
  query SensorTableQuery($sensor: SensorName!, $fromDate: DateTime!) {
    data: search(sensor: $sensor, fromDate: $fromDate, sortOrder: desc) {
      dt
      temp_c
      dewpoint
      humidity
      pressure
    }
  }
`;

const ReactTable = ({ queryRef }) => {
  const { data } = usePreloadedQuery(SensorTableQuery, queryRef);

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
};

const SensorTable = () => {
  const params = useParams();
  const [tableDataQueryRef, loadTableDataQuery] = useQueryLoader(SensorTableQuery);

  const sensorName = React.useMemo(
    () => sensorConfig.find(({ id }) => id === params.id)?.name,
    [params.id],
  );

  const currentDate = React.useContext(ReferenceDateContext);
  const [fromDate, setFromDate] = React.useState(getPastDate(30, 'minutes', currentDate));

  React.useEffect(() => {
    setFromDate(getPastDate(30, 'minutes', currentDate));
  }, [currentDate]);

  React.useEffect(() => {
    loadTableDataQuery({ sensor: params.id, fromDate: fromDate.toISOString() });
  }, [fromDate, params.id, loadTableDataQuery]);

  return (
    <>
      <Typography variant="h6" sx={{ m: 2, width: '100%', textAlign: 'center' }}>
        {sensorName}
      </Typography>
      <Suspense fallback={<SensorSkeleton />}>
        {tableDataQueryRef && <ReactTable queryRef={tableDataQueryRef} />}
      </Suspense>
    </>
  );
};

export default React.memo(SensorTable);
