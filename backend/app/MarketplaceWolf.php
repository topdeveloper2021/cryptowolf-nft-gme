<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Throwable;
use Exception;

class MarketplaceWolf extends Model
{
    use HasFactory;

    protected $table = "marketplace_wolfs";

    public function wolf()
    {
        return $this->hasOne('App\Wolf', 'id', 'wolf_id');
    }

    public function addWolf($wolf_id, $marketplace_id, $tx_hash, $price, $verified = 0)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = new MarketplaceWolf();
            $mktMaterial->wolf_id = $wolf_id;
            $mktMaterial->marketplace_id = $marketplace_id;
            $mktMaterial->price = $price;
            $mktMaterial->hash = $tx_hash;
            $mktMaterial->verified = $verified;
            $mktMaterial->save();

            $response["status"] = 1;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$wolf_id, $marketplace_id, $tx_hash, $price, $verified], $e->getMessage());
        }

        return $response;
    }

    public function verify($idMkt)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $mktMaterial = MarketplaceWolf::where("marketplace_id",$idMkt)->firstOrFail();
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
            $mktMaterial = MarketplaceWolf::where("marketplace_id",$idMkt)->firstOrFail();
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
            $mktMaterial = MarketplaceWolf::where("marketplace_id",$idMkt)->firstOrFail();
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
