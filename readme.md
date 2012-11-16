# vectorclock

A simple implementation of vector clocks in Javascript.

## API

[Vector clocks](http://en.wikipedia.org/wiki/Vector_clock) are represented as plain old objects with a "clock" key (which is a hash). For example: `{ clock: { a: 1, b: 2 } }`.

Recommended reading:

- Leslie Lamport (1978). "[Time, clocks, and the ordering of events in a distributed system](https://www.google.com/search?q=Time%2C+clocks%2C+and+the+ordering+of+events+in+a+distributed+system)". Communications of the ACM 21 (7): 558-565.
- Friedemann Mattern (1988). "[Virtual Time and Global States of Distributed Systems](https://www.google.com/search?q=Virtual%20Time%20and%20Global%20States%20of%20Distributed%20Systems)". Workshop on Parallel and Distributed Algorithms: pp. 215-226
- Colin Fidge (1988), "[Timestamps in Message-Passing Systems That Preserve the Partial Ordering](https://www.google.com/search?q=Timestamps+in+Message-Passing+Systems+That+Preserve+the+Partial+Ordering)".

## API

- `increment(clock, nodeId)`: increment a vector clock at "nodeId"
- `merge(a, b)`: given two vector clocks, returns a new vector clock with all values greater than those of the merged clocks
- `compare(a, b)` / `ascSort(a, b)`: compare two vector clocks, returns -1 for a < b and 1 for a > b; 0 for concurrent and identical values. Can be used to sort an array of objects by their "clock" key via [].sort(VClock.ascSort)
- `descSort(a, b)`: sorts in descending order (N, ... 3, 2, 1)
- `isConcurrent(a, b)`: if A and B are equal, or if they occurred concurrently.
- `isIdentical(a, b)`: if every value in both vector clocks is equal.

## Implementing read repair using vector clocks

Here is one way to implement read repair by detecting which clocks are concurrent, and if necessary, returning multiple values:

    var responses = [ { clock: ... }, { clock: ... }];
    // sort the responses by the vector clocks
    responses.sort(VClock.descSort);
    // then compare them to the topmost
    // (in sequential order, the greatest) item
    var repaired = [ responses.shift() ];
    responses.forEach(function(item, index) {
      // if they are concurrent with that item, then there is a conflict
      // that we cannot resolve, so we need to return the item.
      if(VClock.isConcurrent(item, repaired[0]) &&
        !VClock.isIdentical(item, repaired[0])) {
        repaired.push(item);
      }
    });
