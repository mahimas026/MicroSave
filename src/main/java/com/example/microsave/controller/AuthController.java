package com.example.microsave.controller;

import com.example.microsave.entity.MemberAccount;
import com.example.microsave.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTER
    @PostMapping("/register")
    public Map<String, Object> register(
            @RequestBody Map<String, String> request) {

        Long memberId =
                Long.valueOf(request.get("memberId"));

        MemberAccount account =
                authService.register(
                        memberId,
                        request.get("memberName"),
                        request.get("phone"),
                        request.get("username"),
                        request.get("password")
                );

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Registration successful");
        response.put("username", account.getUsername());
        response.put("role", "MEMBER");
        response.put("memberId",
                account.getMember().getMemberId());
        response.put("memberName",
                account.getMember().getMemberName());
        response.put("groupId",
                account.getMember().getGroup().getGroupId());
        response.put("groupName",
                account.getMember().getGroup().getGroupName());

        return response;
    }


    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        // ADMIN LOGIN
        if ("admin".equals(username)
                && "admin123".equals(password)) {

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Login successful");
            response.put("username", "admin");
            response.put("role", "ADMIN");

            return response;
        }

        // MEMBER LOGIN
        MemberAccount account =
                authService.login(username, password);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("username", account.getUsername());
        response.put("role", "MEMBER");
        response.put("memberId",
                account.getMember().getMemberId());
        response.put("memberName",
                account.getMember().getMemberName());
        response.put("groupId",
                account.getMember().getGroup().getGroupId());
        response.put("groupName",
                account.getMember().getGroup().getGroupName());

        return response;
    }
}