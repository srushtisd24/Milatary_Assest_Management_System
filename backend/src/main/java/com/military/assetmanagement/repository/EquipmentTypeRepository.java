package com.military.assetmanagement.repository;
import com.military.assetmanagement.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long> {
}
