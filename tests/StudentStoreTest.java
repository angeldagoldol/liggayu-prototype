/** Run without JUnit: javac -d build src/StudentStore.java tests/StudentStoreTest.java */
public final class StudentStoreTest {
    private static int passed;
    private static int failed;

    public static void main(String[] args) {
        test("empty report has no fake averages", () -> {
            var r = new StudentStore().getReport();
            check(r != null, "The store must return a report, including when empty.");
            check(r.students().length == 0, "empty students");
            check(r.classAverage() == null && r.highestAverage() == null
                    && r.lowestAverage() == null, "empty summaries must be null");
        });
        test("adds a trimmed name and three stored scores", () -> {
            var r = add(new StudentStore(), "  Ana Santos  ", "80", "90", "100");
            check(r.students().length == 1, "one record");
            var row = r.students()[0];
            check(row.index() == 0 && row.name().equals("Ana Santos"), "name/index");
            near(row.scores()[0], 80); near(row.scores()[2], 100); near(row.average(), 90);
        });
        test("one student is both highest and lowest", () -> {
            var r = add(new StudentStore(), "Ana", "80", "90", "100");
            check(r.students()[0].highest() && r.students()[0].lowest(), "both extrema");
            near(r.classAverage(), 90); near(r.highestAverage(), 90); near(r.lowestAverage(), 90);
        });
        test("computes a repeating average without premature rounding", () -> {
            near(add(new StudentStore(), "Ana", "75", "88", "94").students()[0].average(), 257.0 / 3);
        });
        test("finds highest and lowest by average, not one individual score", () -> {
            var s = new StudentStore();
            add(s, "One hundred", "100", "0", "0");
            var r = add(s, "Consistent", "70", "70", "70");
            check(r.students()[0].lowest() && !r.students()[0].highest(), "low row");
            check(r.students()[1].highest() && !r.students()[1].lowest(), "high row");
        });
        test("returns every highest and lowest tie", () -> {
            var s = new StudentStore();
            add(s, "A", "90", "90", "90"); add(s, "B", "80", "90", "100");
            add(s, "C", "10", "20", "30"); var r = add(s, "D", "20", "20", "20");
            check(r.students()[0].highest() && r.students()[1].highest(), "two highest");
            check(r.students()[2].lowest() && r.students()[3].lowest(), "two lowest");
            near(r.classAverage(), 55);
        });
        test("all equal students receive both labels", () -> {
            var s = new StudentStore(); add(s, "A", "50", "50", "50");
            var r = add(s, "B", "40", "50", "60");
            for (var row : r.students()) check(row.highest() && row.lowest(), "all tied");
        });
        test("decimal ties are independent of floating point addition order", () -> {
            var s = new StudentStore(); add(s, "A", "0.1", "0.2", "0.3");
            var r = add(s, "B", "0.3", "0.2", "0.1");
            for (var row : r.students()) { check(row.highest() && row.lowest(), "exact tie"); near(row.average(), .2); }
        });
        test("equal displayed averages do not create a false tie", () -> {
            var s = new StudentStore(); add(s, "A", "90", "90", "90");
            var r = add(s, "B", "90", "90", "90.01");
            check(!r.students()[0].highest() && r.students()[1].highest(), "compare unrounded totals");
            check(r.students()[0].lowest() && !r.students()[1].lowest(), "lower total");
        });
        test("accepts zero and 100", () -> {
            var s = new StudentStore(); add(s, "Zero", "0", "0.00", "0");
            var r = add(s, "Perfect", "100", "100.00", "100");
            near(r.lowestAverage(), 0); near(r.highestAverage(), 100); near(r.classAverage(), 50);
        });
        test("accepts two-decimal scores and a leading decimal point", () -> {
            var r = add(new StudentStore(), "Decimal", "88.75", ".5", " 90.25 ");
            near(r.students()[0].average(), 179.5 / 3);
        });
        test("rejects missing or blank names", () -> {
            for (String name : new String[] {null, "", "   ", "\t", "\u00a0", "\u2007", "\u202f"}) {
                var s = new StudentStore(); rejects(IllegalArgumentException.class, () -> add(s, name, "1", "2", "3"));
                check(s.getReport().students().length == 0, "no mutation");
            }
        });
        test("limits names to 80 characters", () -> {
            add(new StudentStore(), "A".repeat(80), "1", "2", "3");
            rejects(IllegalArgumentException.class, () -> add(new StudentStore(), "A".repeat(81), "1", "2", "3"));
        });
        test("rejects control characters in names", () -> {
            rejects(IllegalArgumentException.class, () -> add(new StudentStore(), "Ana\nSantos", "1", "2", "3"));
        });
        test("preserves Unicode and HTML-like names as plain data", () -> {
            String name = "José 李 <b>O'Neil</b> \"Q\" \\";
            check(add(new StudentStore(), name, "1", "2", "3").students()[0].name().equals(name), "preserve text");
        });
        test("rejects missing scores or wrong score count", () -> {
            var s = new StudentStore();
            rejects(IllegalArgumentException.class, () -> s.add("A", null));
            rejects(IllegalArgumentException.class, () -> s.add("A", new String[] {"1", "2"}));
            rejects(IllegalArgumentException.class, () -> s.add("A", new String[] {"1", "2", "3", "4"}));
            rejects(IllegalArgumentException.class, () -> add(s, "A", "1", null, "3"));
            rejects(IllegalArgumentException.class, () -> add(s, "A", "1", "", "3"));
        });
        test("rejects scores outside 0 to 100", () -> {
            for (String value : new String[] {"-1", "100.01", "101", "9999999999999999"})
                rejects(IllegalArgumentException.class, () -> add(new StudentStore(), "A", "50", value, "50"));
        });
        test("rejects nonnumeric, nonfinite and exponential values", () -> {
            for (String value : new String[] {"abc", "NaN", "Infinity", "-Infinity", "1e2", "0x64", "90,5", "--1"})
                rejects(IllegalArgumentException.class, () -> add(new StudentStore(), "A", value, "50", "50"));
        });
        test("rejects more than two decimal places", () -> {
            rejects(IllegalArgumentException.class, () -> add(new StudentStore(), "A", "1.234", "50", "50"));
        });
        test("failed insertion is atomic", () -> {
            var s = new StudentStore(); add(s, "Original", "70", "80", "90");
            rejects(IllegalArgumentException.class, () -> add(s, "Broken", "60", "70", "oops"));
            var r = s.getReport(); check(r.students().length == 1, "no partial record");
            check(r.students()[0].name().equals("Original"), "preserve original"); near(r.classAverage(), 80);
        });
        test("duplicate names remain separate records", () -> {
            var s = new StudentStore(); add(s, "Ana", "0", "0", "0");
            var r = add(s, "Ana", "100", "100", "100");
            check(r.students().length == 2 && r.students()[1].index() == 1, "separate indices");
        });
        test("snapshot arrays cannot mutate stored records", () -> {
            var s = new StudentStore(); var r = add(s, "Original", "70", "80", "90");
            r.students()[0].scores()[0] = 0; r.students()[0] = null;
            near(s.getReport().students()[0].scores()[0], 70); near(s.getReport().classAverage(), 80);
        });
        test("capacity 100 has no overflow or partial insertion", () -> {
            var s = new StudentStore();
            for (int i = 0; i < 100; i++) add(s, "Student " + i, "70", "80", "90");
            rejects(IllegalStateException.class, () -> add(s, "Overflow", "70", "80", "90"));
            check(s.getReport().students().length == 100, "capacity");
        });
        test("reset returns to empty and reuses index zero", () -> {
            var s = new StudentStore(); add(s, "Old", "100", "100", "100");
            check(s.clear().students().length == 0, "empty reset");
            var r = add(s, "New", "0", "0", "0");
            check(r.students()[0].index() == 0, "index zero"); near(r.classAverage(), 0);
        });
        test("fictional samples contain ties and a known average", () -> {
            var r = new StudentStore().loadSample();
            check(r.students().length == 6, "six demo rows");
            near(r.classAverage(), 515.0 / 6); near(r.highestAverage(), 95); near(r.lowestAverage(), 70);
            int ties = 0; for (var row : r.students()) if (row.highest()) ties++;
            check(ties == 2, "two highest demo rows");
        });
        test("sample loading never replaces existing records", () -> {
            var s = new StudentStore(); add(s, "Keep me", "1", "2", "3");
            rejects(IllegalStateException.class, () -> s.loadSample());
            check(s.getReport().students().length == 1, "preserved");
        });
        System.out.println("\nJava core: " + passed + " passed, " + failed + " failed.");
        if (failed > 0) System.exit(1);
    }

    private static StudentStore.Report add(StudentStore s, String name, String a, String b, String c) {
        return s.add(name, new String[] {a, b, c});
    }
    private static void check(boolean condition, String reason) {
        if (!condition) throw new AssertionError(reason);
    }
    private static void near(Double actual, double expected) {
        check(actual != null && Math.abs(actual - expected) < 1e-9, "expected " + expected + ", got " + actual);
    }
    private static void rejects(Class<? extends Throwable> type, Runnable action) {
        try { action.run(); } catch (Throwable error) {
            if (type.isInstance(error)) return;
            throw new AssertionError("Wrong exception: " + error, error);
        }
        throw new AssertionError("Expected " + type.getSimpleName());
    }
    private static void test(String name, Runnable action) {
        try { action.run(); passed++; System.out.println("PASS  " + name); }
        catch (Throwable error) { failed++; System.out.println("FAIL  " + name + ": " + error); }
    }
}
