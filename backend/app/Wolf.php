<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Throwable;
use Exception;

class Wolf extends Model
{
    use HasFactory;

    protected $table = "wolfs";

    public function addWolf($nft_id, $address, $wallet_owner, $rarity, $breed, $gender, $hp, $atack, $defense)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $wolf = new Wolf();
            $wolf->nft_id = $nft_id;
            $wolf->contract_address = $address;
            $wolf->owner = $wallet_owner;
            $wolf->rarity = $rarity;
            $wolf->breed = $breed;
            $wolf->gender = $gender;
            $wolf->hp = $hp;
            $wolf->atack = $atack;
            $wolf->defense = $defense;
            $wolf->save();

            $response["status"] = 1;
            $response["data"] = $wolf;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$nft_id, $address, $wallet_owner, $rarity, $breed, $gender, $hp, $atack, $defense], $e->getMessage());
        }

        return $response;
    }
}
