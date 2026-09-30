package com.military.assetmanagement.repository;
import com.military.assetmanagement.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByBaseId(Long baseId);
    Optional<Asset> findByBaseIdAndEquipmentTypeId(Long baseId, Long equipmentTypeId);
}
