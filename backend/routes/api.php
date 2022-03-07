<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "API up";
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/wolfs/list-ajax', 'WolfsController@listAjax')->name("wolfs.list.ajax");
Route::get('/materials/list-ajax', 'MaterialsController@listAjax')->name("materials.list.ajax");

Route::post('/materials/insert-ajax', 'MaterialsController@insertAjax')->name("materials.insert.ajax");
Route::post('/wolfs/insert-ajax', 'WolfsController@insertAjax')->name("wolfs.insert.ajax");

Route::get('/marketplace/wolfs/list-ajax', 'MarketplaceController@listWolfsAjax')->name("marketplace.wolfs.list.ajax");
Route::get('/marketplace/materials/list-ajax', 'MarketplaceController@listMaterialsAjax')->name("marketplace.materials.list.ajax");

Route::post('/marketplace/material/insert-ajax', 'MarketplaceController@insertMaterialAjax')->name("marketplace.material.insert.ajax");
Route::post('/marketplace/wolf/insert-ajax', 'MarketplaceController@insertWolfAjax')->name("marketplace.wolf.insert.ajax");

Route::post('/marketplace/nft/remove-ajax', 'MarketplaceController@removeMktItemAjax')->name("marketplace.nft.remove.ajax");
Route::post('/marketplace/nft/edit-ajax', 'MarketplaceController@editMktItemAjax')->name("marketplace.nft.edit.ajax");
Route::post('/marketplace/nft/verify', 'MarketplaceController@verifyMktItemAjax')->name("marketplace.nft.verify.ajax");