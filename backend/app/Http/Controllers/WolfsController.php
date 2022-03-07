<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Wolf;

use Auth;
use DB;

use Throwable;
use Exception;

class WolfsController extends Controller
{
    public function listAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $query = Wolf::select("*");

            if(isset($request->wallet))
                $query->where("owner", $request->wallet);

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

    public function insertAjax(Request $request)
    {
        $response = Array("status" => -1, "message" => "", "data" => array());

        try {
            $insertResponse = Wolf::addWolf($request->nft_id, $request->contract_address, $request->owner, $request->rarity, $request->breed, $request->gender, $request->hp, $request->atack, $request->defense);

            if($insertResponse["status"] == 1){
                $response["status"] = 1;
                $response["message"] = "Wolf added correctly";
                $response["data"] = $insertResponse["data"];
            }
            else
                $response["message"] = $insertResponse["message"];

        }catch (Throwable $e){
            $response["message"] = $e->getMessage()."/".$e->getLine();
            LogError::saveError(__CLASS__ . "(" .__FUNCTION__ . ")/".$e->getLine(), [$request->all()], $e->getMessage());
        }
        finally {
            return response()->json($response, ($response["status"] == 1?200:400));
        }
    }
}
