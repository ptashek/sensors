import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import RelayQueryResponseCache from 'relay-runtime/lib/network/RelayQueryResponseCache';

const oneMinute = 60 * 1000;
const cache = new RelayQueryResponseCache({ size: 10, ttl: oneMinute });

function fetchQuery(operation, variables, cacheConfig) {
  const queryID = operation.text;
  const isQuery = operation.operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (isQuery && fromCache !== null && !forceFetch) {
    return fromCache;
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  };

  return Promise.race([
    fetch('/api', requestOptions),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), oneMinute)),
  ])
    .then((response) => response.json())
    .then((json) => {
      // Update cache on queries
      if (isQuery && json) {
        cache.set(queryID, variables, json);
      }

      return json;
    });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
