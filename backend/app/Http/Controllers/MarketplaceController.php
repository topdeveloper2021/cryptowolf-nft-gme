<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Wolf;
use App\Material;
use App\MarketplaceWolf;
use App\MarketplaceMaterial;
use App\MarketplaceHistory;

use Auth;
use DB;

use Throwable;
use Exception;

class MarketplaceController extends Controller
{
    public function listMaterialsAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $query = MarketplaceMaterial::with("material")->select("*");

            if(isset($request->wallet)){
                $query = $query->whereHas('material', function ($query) use($request) {
                    $query->where("owner", $request->wallet);
                });
            }

            $query = $query->where("verified", 1);

            $list = $query->paginate(40);

            $response = $list;
        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function listWolfsAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $query = MarketplaceWolf::with("wolf")->select("*");

            if(isset($request->wallet)){
                $query = $query->whereHas('wolf', function ($query) use($request) {
                    $query->where("owner", $request->wallet);
                });
            }

            $list = $query->paginate(40);

            $response = $list;

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function insertMaterialAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $material = Material::where("nft_id", $request->nft_id)->firstOrFail();

            if($material->owner == $request->walletOwner){

                $insertResponse = MarketplaceMaterial::addMaterial($material->id, $request->marketplace_id, $request->tx_hash, $request->price);

                if($insertResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Material added to marketplace correctly";
                }
                else
                    $response["message"] = $insertResponse["message"];
            }
            else
                $response["message"] = "NFT owner error";
        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function insertWolfAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $wolf = Wolf::where("nft_id", $request->nft_id)->firstOrFail();

            if($wolf->owner == $request->walletOwner){

                $insertResponse = MarketplaceWolf::addWolf($wolf->id, $request->marketplace_id, $request->tx_hash, $request->price);

                if($insertResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Wolf added to marketplace correctly";
                }
                else
                    $response["message"] = $insertResponse["message"];
            }
            else
                $response["message"] = "NFT owner error";

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function verifyMktItemAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            if($request->type == "material"){
                $verifyResponse = MarketplaceMaterial::verify($request->mkt_id);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market material verified correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            elseif($request->type == "wolf"){
                $verifyResponse = MarketplaceWolf::verify($request->mkt_id);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market wolf verified correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            else
                $response["message"] = "NFT owner error";

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function editMktItemAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            if($request->type == "material"){
                $verifyResponse = MarketplaceMaterial::edit($request->mkt_id, $request->price);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market material edited correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            elseif($request->type == "wolf"){
                $verifyResponse = MarketplaceWolf::edit($request->mkt_id, $request->price);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market wolf edited correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            else
                $response["message"] = "NFT owner error";

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }

    public function removeMktItemAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            if($request->type == "material"){
                $verifyResponse = MarketplaceMaterial::remove($request->mkt_id);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market material removed correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            elseif($request->type == "wolf"){
                $verifyResponse = MarketplaceWolf::remove($request->mkt_id);

                if($verifyResponse["status"] == 1){
                    $response["status"] = 1;
                    $response["message"] = "Market wolf removed correctly";
                }
                else
                    $response["message"] = $verifyResponse["message"];
            }
            else
                $response["message"] = "NFT owner error";

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }
}