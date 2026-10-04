package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Collections;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.demo.exception.DuplicateFarmException;
import com.example.demo.exception.InvalidNameException;
import com.example.demo.exception.InvalidPhoneException;
import com.example.demo.model.Farmer;
import com.example.demo.repo.FarmerRepo;

@ExtendWith(MockitoExtension.class)
public class FarmerServiceTest {

    @Mock
    private FarmerRepo repo;

    @InjectMocks
    private FarmerService farmerService;

    private Farmer validFarmer;

    @BeforeEach
    void setUp() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        validFarmer = new Farmer();
        validFarmer.setFarmerName("Ramesh Patel");
        validFarmer.setPhoneNumber("9822334455");
        validFarmer.setLocation("Nashik, Maharashtra");
        validFarmer.setFarmName("Green Valley Farm");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should successfully register farm when data is valid")
    void testAddFarmSuccess() {
        when(repo.existsByUserIdAndFarmName(1, "Green Valley Farm")).thenReturn(false);
        when(repo.save(any(Farmer.class))).thenAnswer(i -> {
            Farmer f = i.getArgument(0);
            f.setId(10);
            return f;
        });

        Farmer saved = farmerService.add(validFarmer);

        assertNotNull(saved);
        assertEquals(10, saved.getId());
        assertEquals(1, saved.getUserId());
        assertEquals("Green Valley Farm", saved.getFarmName());
        verify(repo, times(1)).save(any(Farmer.class));
    }

    @Test
    @DisplayName("Should throw InvalidNameException when farmer name contains digits")
    void testAddFarmInvalidName() {
        validFarmer.setFarmerName("Ramesh123");

        assertThrows(InvalidNameException.class, () -> {
            farmerService.add(validFarmer);
        });
        verify(repo, never()).save(any(Farmer.class));
    }

    @Test
    @DisplayName("Should throw InvalidPhoneException when phone number is not 10 digits")
    void testAddFarmInvalidPhone() {
        validFarmer.setPhoneNumber("982233");

        assertThrows(InvalidPhoneException.class, () -> {
            farmerService.add(validFarmer);
        });
        verify(repo, never()).save(any(Farmer.class));
    }

    @Test
    @DisplayName("Should throw DuplicateFarmException when user already has farm with same name")
    void testAddFarmDuplicateName() {
        when(repo.existsByUserIdAndFarmName(1, "Green Valley Farm")).thenReturn(true);

        assertThrows(DuplicateFarmException.class, () -> {
            farmerService.add(validFarmer);
        });
        verify(repo, never()).save(any(Farmer.class));
    }

    @Test
    @DisplayName("Should parse CSV and report errors on invalid rows while saving valid rows")
    void testImportCsv() {
        String csv = "FarmName,FarmerName,PhoneNumber,Location,AreaAcres,SoilType,WaterSource,SurveyNumber\n" +
                "Sunshine Farm,Suresh Raina,9876543210,Nashik,6.5,Clay,Canal,SRV-201\n" +
                "Bad Farm,InvalidName123,9876543210,Pune,4.0,Loam,Well,SRV-202\n" +
                "Short Phone Farm,Vijay Kumar,12345,Nagpur,3.0,Sandy,Borewell,SRV-203\n";

        when(repo.existsByUserIdAndFarmName(eq(1), anyString())).thenReturn(false);
        when(repo.save(any(Farmer.class))).thenAnswer(i -> i.getArgument(0));

        java.util.Map<String, Object> result = farmerService.importCsv(csv);
        assertNotNull(result);
        assertEquals(3, result.get("totalRowsProcessed"));
        assertEquals(1, result.get("successfulImports"));
        assertEquals(2, result.get("failedRowsCount"));
    }

    @Test
    @DisplayName("Should filter farms based on search criteria")
    void testSearchFarms() {
        Farmer f1 = new Farmer();
        f1.setLocation("Nashik Central");
        f1.setSoilType("Clay");
        f1.setWaterSource("Canal");
        f1.setStatus("Active");

        Farmer f2 = new Farmer();
        f2.setLocation("Pune East");
        f2.setSoilType("Loamy");
        f2.setWaterSource("Borewell");
        f2.setStatus("Verified");

        when(repo.findByUserId(1)).thenReturn(java.util.List.of(f1, f2));

        java.util.List<Farmer> result = farmerService.search("Nashik", null, null, null);
        assertEquals(1, result.size());
        assertEquals("Clay", result.get(0).getSoilType());
    }
}
