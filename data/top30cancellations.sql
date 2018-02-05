SELECT ontime.Year AS year, ontime.Month AS month, ontime.Origin AS iata, SUM(ontime.Cancelled) AS cancelled, COUNT(*) AS allFlights
FROM ontime
INNER JOIN top30airports ON ontime.Origin = top30airports.iata
GROUP BY ontime.Year, ontime.Month, ontime.Origin;