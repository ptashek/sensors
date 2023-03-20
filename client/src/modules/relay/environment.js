import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import RelayQueryResponseCache from 'relay-runtime/lib/network/RelayQueryResponseCache';

const oneMinute = 60 * 1000;
const cache = new RelayQueryResponseCache({ size: 10, ttl: oneMinute });

function fetchQuery(operation, variables, cacheConfig) {
  const { cacheID, operationKind, text: queryText } = operation;
  const isQuery = operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  if (isQuery && !forceFetch) {
    const fromCache = cache.get(cacheID, variables);
    if (fromCache !== null) {
      return fromCache;
    }
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryText,
      variables,
    }),
    withCredentials: true,
  };

  return Promise.race([
    fetch('/api', requestOptions),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), oneMinute)),
  ])
    .then((response) => response.json())
    .then((json) => {
      // Update cache on queries
      if (isQuery && json) {
        cache.set(cacheID, variables, json);
      }

      return json;
    });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
