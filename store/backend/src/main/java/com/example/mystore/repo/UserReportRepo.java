package com.example.mystore.repo;

import com.example.mystore.entity.User;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UserReportRepo {

    private final com.example.mystore.repo.UserRepository userRepository;

    public UserReportRepo(com.example.mystore.repo.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getUserList() {
        return userRepository.findAll();
    }
}
