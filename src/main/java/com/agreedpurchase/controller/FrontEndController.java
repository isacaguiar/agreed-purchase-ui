package com.agreedpurchase.controller;

import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class FrontEndController {
  @GetMapping("/")
  public String main(Model model) {

    return "pix"; //view
  }
}
