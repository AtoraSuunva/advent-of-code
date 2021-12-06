# About this solution

Part 1 uses an unoptimized way of getting overlapping points. (Because this was the first way I thought of.)

It works by generating a point for every spot on the ocean floor and asking every line if they overlap that point (this is very slow.)

Part 2 uses a much more optimized way of getting overlapping points, by instead having each line cache all points they overlap (including the starting and end points) and then instead just enumerating every point in every line and increasing the "overlap" count.

The time taken for solution 1 depends on `width * height * #lines`.

The time taken for solution 2 depends on only `#points`.

---

For reference, with the puzzle input:

p1: `990 * 991 * 500 = 490,545,000` (`hasPoint()` checks!! This involved ~5 comparisons and a function call, so very slow!)

(Diagonals needed even more time because they would have to generate their own points to check!)

p2: `193,528` (just `this.board[point.y][point.x]++`, so much faster)

---

The part 2 solution is significantly faster (even faster than part 1 _while_ checking diagonals) at the cost of needing more memory to store all the points.

But the memory usage is negligible at the size of input, so a perfectly fine compromise.

Part 1 is left as-is and unoptimized to show the power of caching and optimization :)
