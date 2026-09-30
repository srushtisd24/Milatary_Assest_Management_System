import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ClearData {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3308/military_asset_management?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "root";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0;");
            stmt.execute("TRUNCATE TABLE assignments;");
            stmt.execute("TRUNCATE TABLE transfers;");
            stmt.execute("TRUNCATE TABLE expenditures;");
            stmt.execute("TRUNCATE TABLE purchases;");
            // DO NOT truncate inventory as it might have important starting counts, or wait, truncate it too so it's clean.
            stmt.execute("TRUNCATE TABLE inventory;");
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1;");
            
            System.out.println("SUCCESSFULLY CLEARED DATA!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
