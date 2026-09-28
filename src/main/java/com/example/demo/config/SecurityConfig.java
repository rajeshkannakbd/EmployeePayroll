package com.example.demo.config;

import com.example.demo.security.CustomJwtAuthenticationConverter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // PASSWORD ENCODER
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // JWT AUTHENTICATION CONVERTER
    @Bean
    public CustomJwtAuthenticationConverter jwtAuthenticationConverter() {
        return new CustomJwtAuthenticationConverter();
    }


    // CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // SECURITY FILTER CHAIN
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )

            .csrf(csrf ->
                    csrf.disable()
            )

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth

                    // =================================================
                    // PUBLIC AUTHENTICATION ENDPOINTS
                    // =================================================

                    .requestMatchers(
                            HttpMethod.POST,
                            "/auth/login",
                            "/auth/signup"
                    ).permitAll()


                    // =================================================
                    // CORS PREFLIGHT
                    // =================================================

                    .requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()


                    // =================================================
                    // EMPLOYEE PASSWORD CHANGE
                    // =================================================

                    .requestMatchers(
                            HttpMethod.POST,
                            "/auth/change-password"
                    ).hasRole("EMPLOYEE")


                    // =================================================
                    // EMPLOYEE SELF-SERVICE
                    // =================================================

                    .requestMatchers(
                            "/employees/me",
                            "/attendance/me",
                            "/payrolls/me/**"
                    ).hasRole("EMPLOYEE")


                    // =================================================
                    // ALL OTHER REQUESTS
                    //
                    // Controller-level @PreAuthorize handles
                    // the actual permission.
                    // =================================================

                    .anyRequest().authenticated()
            )

            .oauth2ResourceServer(oauth2 ->
                    oauth2.jwt(jwt ->
                            jwt.jwtAuthenticationConverter(
                                    jwtAuthenticationConverter()
                            )
                    )
            );

        return http.build();
    }
}