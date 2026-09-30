package com.military.assetmanagement;

import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE assignments DROP COLUMN personnel_id");
            jdbcTemplate.execute("ALTER TABLE assignments DROP COLUMN return_date");
            jdbcTemplate.execute("ALTER TABLE assignments DROP COLUMN remarks");
            jdbcTemplate.execute("ALTER TABLE assignments DROP COLUMN assignment_date");
        } catch (Exception e) {}

        try {
            jdbcTemplate.execute("ALTER TABLE expenditures DROP COLUMN amount");
            jdbcTemplate.execute("ALTER TABLE expenditures DROP COLUMN category");
        } catch (Exception e) {}

        if (baseRepository.count() == 0) {
            Base hq = new Base();
            hq.setName("Central Base");
            hq.setLocation("Headquarters");
            hq.setCode("CENTRAL-00");
            hq.setActive(true);
            baseRepository.save(hq);
        }

        Base hq = baseRepository.findAll().get(0);

        User admin = userRepository.findByUsername("admin").orElse(new User());
        if (admin.getId() == null) {
            admin.setUsername("admin");
            admin.setEmail("admin@military.demo");
            admin.setFullName("System Admin");
            admin.setRole("ROLE_ADMIN");
            admin.setBase(hq);
            admin.setActive(true);
        }
        if (admin.getBase() == null) {
            admin.setBase(hq);
        }
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        userRepository.save(admin);
        
        userRepository.findByUsername("commander").ifPresent(commander -> {
            commander.setPassword(passwordEncoder.encode("Commander@123"));
            userRepository.save(commander);
        });

        userRepository.findByUsername("logistics").ifPresent(logistics -> {
            logistics.setPassword(passwordEncoder.encode("Logistics@123"));
            userRepository.save(logistics);
        });
    }
}
