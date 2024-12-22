# About this solution

Part 1 can be effectively "dumbly" done by just repeating the rules over and over until you've done the required number of steps and then counting the letters, but when trying for 40 steps you will likely OOM (you'd need roughly ~200GB to store the final string).

Part 2 needs to be much more efficiently done via recursion:

  - You only ever need to work on part of the string at a time, and you can discard earlier parts once you've got them counted
  - In the AoC 4-step example, the pair `NN` finally expands to `NBBNBNBBCCN`. Once you've counted those letters, you can discard most of that string since you only need the last letter (`N`) for the following pair (`NC`).
  - Doing it recursively, you only ever need to keep roughly `2 + (3 * max_steps)` characters in memory (+the function calls in stack + some non-large data), which is way less than what is needed to OOM:
    - Check if at max number of steps
      - If yes, then count the letters and return the counts (Stop)
    - If no, then generate the pairs
    - Map every pair into a new polymer by using the insertion rules
    - Recurse over every pair to get the final count of letters from those pairs
    - Collect all the counts together into 1 count and return it (Stop)

This is slow unless you implement caching though, but a simple cache for `polymer + step#` allows it to run near-instantly

---

The expansion of a single pair:

![Expansion](https://cdn.discordapp.com/attachments/688870664941076514/921312545120342056/SPOILER_unknown.png)

Characters required in-memory if doing it recursively:

![Expansion](https://cdn.discordapp.com/attachments/688870664941076514/921312545325850644/SPOILER_unknown.png)
