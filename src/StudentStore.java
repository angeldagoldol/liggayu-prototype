/**
 * CC104 core: parallel arrays, insertion, traversal and minimum/maximum comparison.
 * The same index connects studentNames[i] with studentScores[i][0..2].
 * There is deliberately no database, ArrayList or Map storing the student records.
 */
public final class StudentStore {
    public static final int MAX_STUDENTS = 100;
    public static final int SCORE_COUNT = 3;

    private final String[] studentNames = new String[MAX_STUDENTS];
    private final double[][] studentScores = new double[MAX_STUDENTS][SCORE_COUNT];
    private int studentCount = 0;

    /** A copied row for the website; never a reference to the internal score array. */
    public record StudentRow(int index, String name, double[] scores, double average,
                             boolean highest, boolean lowest) {}
    public record Report(StudentRow[] students, Double classAverage,
                         Double highestAverage, Double lowestAverage) {}

    /** Requirement 1: validate the whole record, then insert it at the next index. */
    public synchronized Report add(String name, String[] scoreInputs) {
        String cleanName = validateName(name);
        if (scoreInputs == null || scoreInputs.length != SCORE_COUNT) {
            throw new IllegalArgumentException("Enter exactly three scores.");
        }
        double[] validatedScores = new double[SCORE_COUNT];
        for (int j = 0; j < SCORE_COUNT; j++) {
            validatedScores[j] = validateScore(scoreInputs[j], j + 1);
        }
        if (studentCount == MAX_STUDENTS) {
            throw new IllegalStateException("The array is full: a maximum of 100 students is allowed.");
        }

        // No storage is changed until every input has passed validation.
        studentNames[studentCount] = cleanName;
        for (int j = 0; j < SCORE_COUNT; j++) {
            studentScores[studentCount][j] = validatedScores[j];
        }
        studentCount++;
        return getReport();
    }

    /** Requirements 2 and 3: traverse the arrays to calculate means and extrema. */
    public synchronized Report getReport() {
        if (studentCount == 0) {
            return new Report(new StudentRow[0], null, null, null);
        }

        int[] totals = new int[studentCount];
        int highestTotal = Integer.MIN_VALUE;
        int lowestTotal = Integer.MAX_VALUE;
        long classTotal = 0;

        for (int i = 0; i < studentCount; i++) {
            totals[i] = totalHundredths(i);
            classTotal += totals[i];
            if (totals[i] > highestTotal) highestTotal = totals[i];
            if (totals[i] < lowestTotal) lowestTotal = totals[i];
        }

        // Requirement 4: build a report snapshot with every tied student marked.
        StudentRow[] rows = new StudentRow[studentCount];
        for (int i = 0; i < studentCount; i++) {
            double average = totals[i] / (100.0 * SCORE_COUNT);
            rows[i] = new StudentRow(i, studentNames[i], studentScores[i].clone(),
                    average, totals[i] == highestTotal, totals[i] == lowestTotal);
        }
        return new Report(rows, classTotal / (100.0 * SCORE_COUNT * studentCount),
                highestTotal / (100.0 * SCORE_COUNT),
                lowestTotal / (100.0 * SCORE_COUNT));
    }

    /** Clear occupied array slots and reuse the arrays; restarting also clears memory. */
    public synchronized Report clear() {
        for (int i = 0; i < studentCount; i++) {
            studentNames[i] = null;
            for (int j = 0; j < SCORE_COUNT; j++) studentScores[i][j] = 0;
        }
        studentCount = 0;
        return getReport();
    }

    /** Fictional data for demonstration, never loaded over a user's existing records. */
    public synchronized Report loadSample() {
        if (studentCount != 0) {
            throw new IllegalStateException("Sample data can only be loaded into an empty report. Reset first.");
        }
        add("Ana Santos", new String[] {"91", "94", "100"});
        add("Beatriz Dela Cruz", new String[] {"78", "82", "80"});
        add("Miguel Cruz", new String[] {"100", "90", "95"});
        add("Carlo Reyes", new String[] {"68", "70", "72"});
        add("Sofia Garcia", new String[] {"88", "90", "92"});
        add("Luis Mendoza", new String[] {"80", "85", "90"});
        return getReport();
    }

    /*
     * Scores permit at most two decimals. Convert each score to hundredth-points
     * before addition so 0.1 + 0.2 + 0.3 and 0.3 + 0.2 + 0.1 are an exact tie.
     * All totals divide by the same 300, so comparing totals compares averages.
     * Display rounding must NEVER decide which student has the higher average.
     */
    private int totalHundredths(int studentIndex) {
        int total = 0;
        for (int j = 0; j < SCORE_COUNT; j++) {
            total += (int) Math.round(studentScores[studentIndex][j] * 100);
        }
        return total;
    }

    private static String validateName(String name) {
        if (name == null || name.codePoints().allMatch(c -> Character.isWhitespace(c) || Character.isSpaceChar(c))) {
            throw new IllegalArgumentException("Enter a student name.");
        }
        String cleanName = name.strip();
        if (cleanName.length() > 80) {
            throw new IllegalArgumentException("Student names must be 80 characters or fewer.");
        }
        if (cleanName.codePoints().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException("Student names cannot contain control characters or line breaks.");
        }
        return cleanName;
    }

    private static double validateScore(String input, int position) {
        String message = "Score " + position + " must be a number from 0 to 100 with at most two decimal places.";
        if (input == null) throw new IllegalArgumentException(message);
        String value = input.strip();
        // Conventional decimal input only: reject empty strings, NaN, infinity and exponents.
        if (value.length() > 12 || !value.matches("(?:[0-9]+(?:\\.[0-9]{1,2})?|\\.[0-9]{1,2})")) {
            throw new IllegalArgumentException(message);
        }
        double score = Double.parseDouble(value);
        if (!Double.isFinite(score) || score < 0 || score > 100) {
            throw new IllegalArgumentException(message);
        }
        return score;
    }
}
