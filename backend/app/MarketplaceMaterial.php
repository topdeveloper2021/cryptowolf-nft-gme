<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Throwable;
use Exception;

class MarketplaceMaterial extends Model
{
    use HasFactory;

    protected $table = "marketplace_materials";

    public function material()
    {
        return $this->hasOne('App\Material', 'id', 'material_id');
    }

    public function addMaterial($material_id, $marketplace_id, $tx_hash, $price, $verified = 0)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = new MarketplaceMaterial();
            $mktMaterial->material_id = $material_id;
            $mktMaterial->marketplace_id = $marketplace_id;
            $mktMaterial->price = $price;
            $mktMaterial->hash = $tx_hash;
            $mktMaterial->verified = $verified;
            $mktMaterial->save();

            $response["status"] = 1;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$material_id, $marketplace_id, $tx_hash, $price, $verified], $e->getMessage());
        }

        return $response;
    }

    public function verify($idMkt)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = MarketplaceMaterial::where("marketplace_id",$idMkt)->firstOrFail();
            $mktMaterial->verified = 1;
            $mktMaterial->save();

            $response["status"] = 1;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$idMkt], $e->getMessage());
        }

        return $response;
    }

    public function remove($idMkt)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = MarketplaceMaterial::where("marketplace_id",$idMkt)->firstOrFail();
            $mktMaterial->remove();

            $response["status"] = 1;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$idMkt], $e->getMessage());
        }

        return $response;
    }

    public function edit($idMkt, $price)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = MarketplaceMaterial::where("marketplace_id",$idMkt)->firstOrFail();
            $mktMaterial->price = $price;
            $mktMaterial->save();

            $response["status"] = 1;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$idMkt], $e->getMessage());
        }

        return $response;
    }
}
