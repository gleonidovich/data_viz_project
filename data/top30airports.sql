SELECT airports.iata AS iata, airports.airport AS airport
FROM airports
INNER JOIN top30airports ON airports.iata = top30airports.iata;