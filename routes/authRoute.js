const {Router}= require(`express`);
const authController = require(`../controller/authController`);
const requireAuth = require(`../middleware/auth_middleware`).requireAuth; //since this middleware was exported as an object and we need only the requireAuth current , so we use the dotnotation to select the requireAuth from the object.


const authRoute = Router();

// authRoute.get(`/home`,authController.home_get);
// authRoute.get(`/register`,authController.register_get);
authRoute.post(`/register`,authController.register_post);
// authRoute.get(`/login`, authController.login_get);
authRoute.post(`/login`, authController.login_post);

//protect this routes here
authRoute.get(`/posts`,requireAuth, authController.getAll);
authRoute.get(`/posts/:id`,requireAuth, authController.get_id);
// authRoute.post(`/content/:id`,requireAuth, authController.send_id);
authRoute.post(`/posts`,requireAuth, authController.Content_post);
authRoute.put(`/posts/:id`,requireAuth, authController.update_put_id);
authRoute.delete(`/posts/:id`,requireAuth,authController.delete_put_id); //make sure not to be able to delete other users post
authRoute.get(`/logout`, authController.logout_get);

module.exports= authRoute;