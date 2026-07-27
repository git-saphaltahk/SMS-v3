package com.example.mystore.security;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.mystore.entity.User;
import com.example.mystore.repo.UserRepository;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u=userRepository.findByEmail(email)
    .orElseThrow(()->new UsernameNotFoundException("User not found:"+email));

        if (!u.isActive()) {
            throw new UsernameNotFoundException("User is inactive: " + email);
        }
       String authority = "ROLE_" + u.getRole().name();

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPasswordHash())
                .authorities(List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(authority)))
                .accountLocked(false)
                .disabled(!u.isActive())
                .build();
    }
}