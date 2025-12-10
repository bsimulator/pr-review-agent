/**
 * Test file with violations for all 78 advanced Java rules
 * Rules 31-78: Advanced concurrency, reflection, streams, security, etc.
 */

import java.util.*;
import java.io.*;
import java.nio.file.*;
import java.lang.reflect.*;
import java.security.*;
import java.text.SimpleDateFormat;
import java.text.NumberFormat;
import java.util.regex.Pattern;
import java.util.stream.*;
import java.util.concurrent.*;

public class TestAdvancedJavaViolations {

  // === CONCURRENCY VIOLATIONS (Rules 31-38) ===
  
  // Rule 31: Double-checked locking pattern
  private static volatile TestAdvancedJavaViolations instance;
  public static TestAdvancedJavaViolations getInstance() {
    if (instance == null) {
      synchronized (TestAdvancedJavaViolations.class) {
        if (instance == null) {
          instance = new TestAdvancedJavaViolations();
        }
      }
    }
    return instance;
  }

  // Rule 32: Busy-wait loop
  private void busyWait() {
    boolean finished = false;
    while (true) {
      if (finished) break;
      Thread.sleep(5);
    }
  }

  // Rule 33: ThreadLocal memory leak
  private static ThreadLocal<String> threadLocal = ThreadLocal.withInitial(() -> "test");
  
  public void useThreadLocal() {
    String value = threadLocal.get();
    // Missing: threadLocal.remove()
  }

  // Rule 34: ConcurrentHashMap iteration
  private void iterateConcurrentHashMap() {
    ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
    for (String key : map.keySet()) {
      map.put(key, "value"); // Concurrent modification
    }
  }

  // Rule 35: Volatile misuse
  private volatile List<String> volatileList = new ArrayList<>();

  // Rule 36: Synchronized method without volatile
  private static Integer counter;
  public static synchronized void incrementCounter() {
    counter++;
  }

  // Rule 37: Lock ordering
  private Object lock1 = new Object();
  private Object lock2 = new Object();
  
  public void methodA() {
    synchronized (lock1) {
      synchronized (lock2) {
        // Operations
      }
    }
  }

  // Rule 38: Deadlock potential
  public void methodB() {
    synchronized (lock2) {
      synchronized (lock1) {
        // Different order - deadlock risk
      }
    }
  }

  // === REFLECTION & SERIALIZATION (Rules 39-42) ===

  // Rule 39: Unsafe reflection
  public void unsafeReflection() throws Exception {
    Field field = String.class.getDeclaredField("value");
    field.setAccessible(true); // Breaking encapsulation
  }

  // Rule 40: Unsafe deserialization
  public Object unsafeDeserialize(InputStream input) throws IOException, ClassNotFoundException {
    ObjectInputStream ois = new ObjectInputStream(input);
    return ois.readObject(); // No validation - RCE risk
  }

  // Rule 41: Missing serialVersionUID
  static class SerializableClass implements Serializable {
    private String data;
    // Missing: private static final long serialVersionUID = 1L;
  }

  // Rule 42: Non-serializable field in Serializable
  static class BadSerializable implements Serializable {
    private static final long serialVersionUID = 1L;
    private Thread thread; // Non-serializable!
  }

  // === STREAM & COLLECTION HANDLING (Rules 43-47) ===

  // Rule 43: Stream not terminated
  public void untilledStream() {
    List<String> list = Arrays.asList("a", "b", "c");
    list.stream().filter(s -> s.length() > 0); // No terminal operation!
  }

  // Rule 44: Parallel stream overhead
  public void parallelStreamOverhead() {
    List<Integer> list = Arrays.asList(1, 2, 3); // Small list
    long sum = list.parallelStream().mapToLong(i -> i).sum(); // Overhead not worth it
  }

  // Rule 45: Iterator modification
  public void iteratorModification() {
    List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));
    Iterator<String> it = list.iterator();
    while (it.hasNext()) {
      String s = it.next();
      list.remove(s); // ConcurrentModificationException!
    }
  }

  // Rule 46: ArrayList remove in loop
  public void arrayListRemoveInLoop() {
    List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
    for (int i = 0; i < list.size(); i++) {
      if (list.get(i).equals("b")) {
        list.remove(i); // O(n²) operation
      }
    }
  }

  // Rule 47: Collecting to mutable list then modifying
  public void mutableCollectionConcern() {
    List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
    List<Integer> evens = numbers.stream()
        .filter(n -> n % 2 == 0)
        .collect(Collectors.toList());
    evens.add(6); // Modifying collected list
  }

  // === DEPENDENCY INJECTION & SPRING (Rules 48-52) ===

  // Rule 48: Missing @Transactional
  public void updateDatabase() { // Should have @Transactional
    // Database update operations
  }

  // Rule 49: Lazy loading outside transaction
  public String getRelatedData() {
    // Accessing lazy-loaded field outside transaction
    // LazyInitializationException
    return "data";
  }

  // Rule 50: Autowiring ambiguity
  // Multiple beans of same type without @Qualifier

  // Rule 51: Spring bean scope violation
  // @Component class with mutable state without @Scope

  // Rule 52: @Transactional on non-public method
  // @Transactional private void doWork() { } // Ignored by Spring!

  // === MEMORY & RESOURCE MANAGEMENT (Rules 53-56) ===

  // Rule 53: Large object allocation in loops
  public void largeAllocationInLoop() {
    for (int i = 0; i < 10000; i++) {
      byte[] largeBuffer = new byte[1024 * 1024]; // 1MB per iteration
      process(largeBuffer);
    }
  }

  // Rule 54: String intern misuse
  public void stringInternMisuse() {
    for (String s : getStrings()) {
      String interned = s.intern(); // Pools strings - memory overhead
    }
  }

  // Rule 55: WeakReference without null checks
  public void weakRefWithoutNull() {
    WeakReference<String> ref = new WeakReference<>("test");
    String value = ref.get(); // Could be null if GC ran
    System.out.println(value.length()); // NPE risk!
  }

  // Rule 56: Unnecessary cloning
  public void unnecessaryCloning() {
    String original = "test";
    Object clone = original.clone(); // Unnecessary, strings are immutable
  }

  // === DESIGN PATTERN VIOLATIONS (Rules 57-59) ===

  // Rule 57: Singleton with mutable INSTANCE
  public static TestAdvancedJavaViolations INSTANCE = new TestAdvancedJavaViolations();

  // Rule 58: Immutability violation
  public class Builder {
    public String mutableField; // Should be final
    public Builder build() { return this; }
  }

  // === API & LIBRARY MISUSE (Rules 60-65) ===

  // Rule 60: HashMap null safety
  public void hashMapNullSafety() {
    HashMap<String, String> map = new HashMap<>();
    String value = map.get("key");
    System.out.println(value.length()); // NPE if key not found
  }

  // Rule 61: SimpleDateFormat thread safety
  private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
  
  public void sharedDateFormat() {
    // dateFormat.parse("2024-01-01"); // Not thread-safe!
  }

  // Rule 62: Regex DoS vulnerability
  public void regexDoSRisk() {
    String pattern = "(a+)+b"; // Catastrophic backtracking!
    String input = "aaaaaaaaaaaaaaaaaaaaab";
    Pattern.compile(pattern).matcher(input).matches();
  }

  // Rule 63: XML XXE vulnerability
  public void xmlXXEVulnerability() throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    // Missing XXE protection
    // factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    // DocumentBuilder builder = factory.newDocumentBuilder();
  }

  // Rule 64: Comparator inconsistency
  public class MyComparator implements Comparator<String> {
    @Override
    public int compare(String a, String b) {
      return a.length() - b.length(); // Inconsistent with equals()
    }
  }

  // Rule 65: NumberFormat thread safety
  private static NumberFormat numberFormat = NumberFormat.getInstance();
  
  public void sharedNumberFormat() {
    // numberFormat.parse("123.45"); // Not thread-safe!
  }

  // === SECURITY VULNERABILITIES (Rules 66-70) ===

  // Rule 66: Command injection
  public void commandInjection() throws Exception {
    String userInput = "malicious; rm -rf /";
    Runtime.getRuntime().exec("sh -c " + userInput); // Shell injection!
  }

  // Rule 67: Path traversal vulnerability
  public void pathTraversal(String userPath) throws IOException {
    File file = new File("/uploads/" + userPath); // Path traversal!
    Files.readAllLines(file.toPath());
  }

  // Rule 68: LDAP injection
  public void ldapInjection(String username) {
    String ldapFilter = "(&(uid=" + username + ")(userPassword=*))"; // LDAP injection!
    // directory.search(ldapFilter);
  }

  // Rule 69: Insecure random
  public void insecureRandom() {
    Random random = new Random(); // Predictable!
    int token = random.nextInt(); // For security, use SecureRandom
  }

  // Rule 70: Weak cryptography
  public void weakCryptography() throws Exception {
    MessageDigest md = MessageDigest.getInstance("MD5"); // Weak!
    md.update("password".getBytes());
  }

  // === DATA STRUCTURE & ALGORITHMS (Rules 71-74) ===

  // Rule 71: O(n²) algorithm
  public void oNSquaredSearch() {
    List<String> haystack = new ArrayList<>();
    List<String> needles = new ArrayList<>();
    
    for (String needle : needles) {
      if (haystack.contains(needle)) { // O(n²)!
        System.out.println(needle);
      }
    }
  }

  // Rule 72: Integer overflow
  public void integerOverflow() {
    int a = Integer.MAX_VALUE;
    int b = a + 1; // Silent overflow!
  }

  // Rule 73: Modulo negative
  public void moduloNegative() {
    int result = -10 % 3; // Result is -1, not 2!
  }

  // Rule 74: Inefficient algorithm
  public void sortInLoop() {
    List<Integer> list = new ArrayList<>();
    for (int i = 0; i < list.size(); i++) {
      Collections.sort(list); // Sorting same list repeatedly!
    }
  }

  // === TESTING & ASSERTION ISSUES (Rules 75-76) ===

  // Rule 75: Assertions in production
  public void assertionInProduction(int value) {
    assert value > 0; // Disabled by default in production!
  }

  // Rule 76: Flaky tests with sleep
  public void testWithSleep() throws InterruptedException {
    Thread.sleep(1000); // Flaky test - timing dependent
    assertTrue(true);
  }

  // === LOGGING & ERROR HANDLING (Rules 77-78) ===

  // Rule 77: Logging in finally
  public void loggingInFinally() {
    try {
      throw new Exception("Test");
    } catch (Exception e) {
      // Handle
    } finally {
      // logger.info("Done"); // May suppress exception
    }
  }

  // Rule 78: Log injection vulnerability
  public void logInjection(String userInput) {
    System.out.println("User action: " + userInput); // Log injection!
  }

  // === HELPER METHODS ===

  private List<String> getStrings() {
    return Arrays.asList("a", "b", "c");
  }

  private void process(byte[] data) {
    // Process data
  }

  private void assertTrue(boolean condition) {
    if (!condition) throw new AssertionError();
  }

  // Dummy DocumentBuilderFactory reference
  private static class DocumentBuilderFactory {
    public static DocumentBuilderFactory newInstance() { return new DocumentBuilderFactory(); }
    public void setFeature(String name, boolean value) {}
  }
}
