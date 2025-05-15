package com.example.thanhtrung.thuongmaidientu.modal;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankDetails {
    private String accountNumber;
    private String accountHolderName;
    private String ifscCode;
}
