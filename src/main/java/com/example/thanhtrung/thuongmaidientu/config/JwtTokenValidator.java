package com.example.thanhtrung.thuongmaidientu.config;

import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtTokenValidator extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenValidator.class);
    private static final List<String> PUBLIC_PATHS = List.of(
        "/auth/.*",
        "/api/products/\\d+/reviews"
    );
    private static final List<Pattern> PUBLIC_PATTERNS = PUBLIC_PATHS.stream()
        .map(path -> Pattern.compile(path))
        .toList();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        logger.debug("Processing request: {} {}", method, path);

        // Skip validation for OPTIONS requests and public paths
        if ("OPTIONS".equalsIgnoreCase(method) || isPublicPath(path)) {
            logger.debug("Skipping JWT validation for {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = request.getHeader(JWT_CONTANT.JWT_HEADER);
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
            try {
                logger.debug("Validating JWT for path: {}", path);
                SecretKey key = Keys.hmacShaKeyFor(JWT_CONTANT.SECRET_KEY.getBytes());
                Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));

                List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, auths);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("JWT validated successfully for user: {}", email);
            } catch (Exception e) {
                logger.error("Invalid JWT token for path {}: {}", path, e.getMessage());
                throw new BadCredentialsException("json web token không hợp lệ...");
            }
        } else {
            logger.warn("No valid JWT token found for path: {}", path);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(path).matches());
    }
}