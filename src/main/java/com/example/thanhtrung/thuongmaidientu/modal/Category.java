package com.example.thanhtrung.thuongmaidientu.modal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotNull(message = "Category ID must not be null")
    @NotBlank(message = "Category ID must not be blank")
    @Column(unique = true)
    private String categoryId;

    @NotNull(message = "Level must not be null")
    private Integer level;
}