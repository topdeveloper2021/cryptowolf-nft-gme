<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Carbon\Carbon;

use Throwable;
use Exception;

class Material extends Model
{
    use HasFactory;

    protected $table = "materials";

    public function addMaterial($nft_id, $address, $wallet_owner, $rarity)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $material = new Material();
            $material->nft_id = $nft_id;
            $material->contract_address = $address;
            $material->owner = $wallet_owner;
            $material->rarity = $rarity;
            $material->save();

            $response["status"] = 1;
            $response["data"] = $material;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$nft_id, $address, $wallet_owner, $rarity], $e->getMessage());
        }

        return $response;
    }
}
