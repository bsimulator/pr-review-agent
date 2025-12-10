// Test Java violations for analyzer
public class TestJavaViolations {
    
    // Violation 1: System.out.println
    public void printDebug() {
        System.out.println("Debug message");
    }
    
    // Violation 2: Empty catch block
    public void handleException() {
        try {
            riskyOperation();
        } catch (Exception e) {
        }
    }
    
    // Violation 3: TODO without description
    public void incompleteFeature() {
        // TODO
        System.out.println("Not implemented");
    }
    
    // Violation 4: Magic numbers
    public void processArray(int[] data) {
        if (data.length > 100) {
            System.out.println("Array too large");
        }
    }
    
    // Violation 5: Long line
    String veryLongString = "This is an extremely long string that exceeds the maximum recommended line length of 120 characters and should be broken into multiple lines";
    
    // Violation 6: Thread.sleep
    public void delay() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    // Violation 7: Hardcoded secret
    private String apiKey = "sk-1234567890abcdef";
    private String password = "admin123";
    
    // Violation 8: Wildcard import (at top of file)
    // import java.util.*;
    
    // Violation 9: Missing JavaDoc
    public String calculateTotal(int price, int tax) {
        return price + tax + "";
    }
    
    // Violation 10: Nested loops
    public void processMatrix(int[][] matrix) {
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                System.out.println(matrix[i][j]);
            }
        }
    }
    
    // Violation 11: SQL Injection
    public void queryDatabase(String username) {
        String query = "SELECT * FROM users WHERE username = '" + username + "'";
        // executeQuery(query);
    }
    
    // Violation 12: Null Pointer Risk
    public String getName(User user) {
        return user.toString();
    }
    
    // Violation 13: Hardcoded DB URL
    private String dbUrl = "jdbc:mysql://localhost:3306/mydb";
    
    // Violation 14: Resource leak
    public void readFile() {
        FileInputStream fis = new FileInputStream("file.txt");
        byte[] data = fis.read();
        // Missing close()
    }
    
    // Violation 15: Generic exception
    public void badErrorHandling() {
        try {
            riskyOperation();
        } catch (Exception e) {
            System.err.println("Error: " + e);
        }
    }
    
    // Violation 16: Thread safety
    private static int counter = 0;
    public void increment() {
        counter++;
    }
    
    // Violation 17: String concatenation in loop
    public String buildString() {
        String result = "";
        for (int i = 0; i < 1000; i++) {
            result = result + i + ",";
        }
        return result;
    }
    
    // Violation 18: High complexity
    public void complexLogic(int a, int b, int c) {
        if (a > 0 && b > 0 && c > 0 && a < 100 && b < 100) {
            System.out.println("Valid");
        }
    }
    
    // Violation 19: Unreachable code
    public int getValue() {
        return 42;
        System.out.println("This is unreachable");
    }
    
    // Violation 20: Snake case variable
    private int user_age = 25;
    
    /**
     * Block comment with TODO
     * TODO improve performance
     */
    public void blockCommentViolation() {
        System.out.println("Test");
    }
    
    private void riskyOperation() throws Exception {
        throw new Exception("Test");
    }
}
