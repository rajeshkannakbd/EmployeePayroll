// package com.example.demo.config;

// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.jdbc.core.JdbcTemplate;
// import org.springframework.security.crypto.password.PasswordEncoder;

// import com.example.demo.entity.Role;

// @Configuration
// public class DataInitializer {

//     @Bean
//     CommandLineRunner initializeUsers(
//             JdbcTemplate jdbcTemplate,
//             PasswordEncoder passwordEncoder
//     ) {
//         return args -> {

//             createAccount(
//                     jdbcTemplate,
//                     passwordEncoder,
//                     "EMP-1001",
//                     "admin123",
//                     Role.ADMIN
//             );

//             createAccount(
//                     jdbcTemplate,
//                     passwordEncoder,
//                     "EMP-1002",
//                     "hr123",
//                     Role.HR
//             );

//             createAccount(
//                     jdbcTemplate,
//                     passwordEncoder,
//                     "EMP-1005",
//                     "employee123",
//                     Role.EMPLOYEE
//             );
//         };
//     }

//     private void createAccount(
//             JdbcTemplate jdbcTemplate,
//             PasswordEncoder passwordEncoder,
//             String employeeCode,
//             String password,
//             Role role
//     ) {

//         String passwordHash =
//                 passwordEncoder.encode(password);

//         int updatedRows = jdbcTemplate.update(
//                 """
//                 UPDATE employee
//                 SET password_hash = ?,
//                     role = ?
//                 WHERE employee_code = ?
//                 """,
//                 passwordHash,
//                 role.name(),
//                 employeeCode
//         );

//         if (updatedRows > 0) {
//             System.out.println(
//                     "Login account configured: "
//                             + employeeCode
//                             + " -> "
//                             + role
//             );
//         } else {
//             System.out.println(
//                     "Employee not found: "
//                             + employeeCode
//             );
//         }
//     }
// }