import {
  HomeIcon,
  TableCellsIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import { SignIn, SignUp } from "@/pages/auth";
import {  FolderIcon, GalleryHorizontal,  NetworkIcon,  SendIcon,  Settings2Icon, ShoppingBagIcon, Tickets, Wallet2 } from "lucide-react";
import EditCarouselBanner from "./pages/dashboard/Banner/EditCarouselBanner";
import AddCarouselBanner from "./pages/dashboard/Banner/AddCarouselBanner";
import ProductList from "./pages/dashboard/products/productList";
import ProductForm from "./pages/dashboard/products/ProductForm";
import EditProductForm from "./pages/dashboard/products/EditProductForm";
import ProductDetails from "./pages/dashboard/products/ProductDetails";
import BlogList from "./pages/dashboard/Blogs/BlogList";
import AddBlogForm from "./pages/dashboard/Blogs/AddBlogForm";
import EditBlogForm from "./pages/dashboard/Blogs/EditBlogForm";
import ManagerTable from "./pages/dashboard/Users/ManagerTable";
import AddManagerForm from "./pages/dashboard/Users/AddManagerForm";
import EditManagerForm from "./pages/dashboard/Users/EditManagerForm";
import CategoryList from "./pages/dashboard/Category/CategoryList";
import AddCategory from "./pages/dashboard/Category/AddCategory";
import EditCategory from "./pages/dashboard/Category/EditCategory";
import BannerDetails from "./pages/dashboard/Banner/BannerDetails";
import BlogDetails from "./pages/dashboard/Blogs/BlogDetails";
import CarouselSettings from "./pages/dashboard/Banner/CarousalSettings";
import Home from "./pages/dashboard/Home";
import StoreList from "./pages/dashboard/Stores/StoreList";
import AddStore from "./pages/dashboard/Stores/AddStore";
import EditStore from "./pages/dashboard/Stores/EditStore";
import BrandList from "./pages/dashboard/Brands/BrandList";
import AddBrand from "./pages/dashboard/Brands/AddBrand";
import EditBrand from "./pages/dashboard/Brands/EditBrand";
import StoreDetails from "./pages/dashboard/Stores/StoreDetails";
import NetworkList from "./pages/dashboard/Networks/NetworkList";
import AddNetwork from "./pages/dashboard/Networks/AddNetwork";
import EditNetwork from "./pages/dashboard/Networks/EditNetwork";
import NetworkDetails from "./pages/dashboard/Networks/NetworkDetails";
import ManageStore from "./pages/dashboard/Stores/ManageStore";
import GoalsList from "./pages/dashboard/Goals/GoalsList";
import EditGoal from "./pages/dashboard/Goals/EditGoal";
import AddGoal from "./pages/dashboard/Goals/AddGoal";
import ClickList from "./pages/dashboard/Clicks/ClickList";
import AssignGoalsForm from "./pages/dashboard/Goals/AssignGoalsForm";
import IpList from "./pages/dashboard/Ip/IpList";
import AddIp from "./pages/dashboard/Ip/AddIp";
import EditIp from "./pages/dashboard/Ip/EditIp";
import PostbackList from "./pages/dashboard/Postback/PostbackList";
import AddPostback from "./pages/dashboard/Postback/AddPostback";
import WalletHistory from "./pages/dashboard/Wallet/WalletHistory";
import WithdrawHistory from "./pages/dashboard/Wallet/WithdrawHistory";
import OfferAffiliate from "./pages/dashboard/AffiliateOffer/OfferAffiliate";
import EditOfferAffiliate from "./pages/dashboard/AffiliateOffer/EditOfferAffiliate";
import AddOfferAffiliate from "./pages/dashboard/AffiliateOffer/AddOfferAffiliate";
import PostbackLogList from "./pages/dashboard/Postback/PostbackLogList";
import SendNotification from "./pages/dashboard/Notifications/SendNotification";
import ConversionList from "./pages/dashboard/Conversion/ConversionList";



const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
        roles: ["admin", "manager"],
        guard: "protected",
      },
      {
        icon: <FolderIcon {...icon} />,
        name: "Reports",
        path: "/reports",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "Clicks",
            path: "/all-clicks",
            roles: ["admin", "manager"],
            guard: "protected",
             element:<ClickList/>
          },
          {
            name: "Conversions",
            path: "/all-conversion",
            roles: ["admin", "manager"],
            guard: "protected",
             element:<ConversionList/>
          },
        ]
      },


      {
        icon: <BuildingStorefrontIcon {...icon} />,
        name: "Ads & Banners",
        path: "/ads",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [

          {
            name: "Banners",
            path: "/banners",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <CarouselSettings/>,

          },
          {
            name: "Add Banner",
            path: "/add-banners",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <AddCarouselBanner/>,
            visible :false

          },
          {
            name: "Edit Banner",
            path: "/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <EditCarouselBanner/>,
            visible :false

          },
          {
            name: "Banner Details",
            path: "/banners/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <BannerDetails/>,
            visible :false

          },

        ]
      },
      {
        icon: <Tickets {...icon} />,
        name: "Products",
        path: "/products",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Products",
            path: "/all-products",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <ProductList />
          },
          {
            name: "Add Products",
            path: "/add-products",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <ProductForm/>,
            visible: false,
          },
          {
            name: "Edit Products",
            path: "/edit-product/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <EditProductForm/>,
            visible: false,
          },
          {
            name: "Product Details",
            path: "/all-products/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:false,
            element :< ProductDetails/>
          },
          {
            name: "Goals ",
            path: "/goals-list",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
            element :< GoalsList/>
          },
          {
            name: "Edit Goals",
            path: "/edit-goal/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:false,
            element :< EditGoal/>
          },
          {
            name: "Add Goals",
            path: "/add-goal",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:false,
            element :< AddGoal/>
          },
          {
            name : "Assign Goals",
            path : "/assign-goals",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
            element :<AssignGoalsForm/>
          },
          {
            name : "Assign Offer",
            path : "/assign-offer",
            roles: ["admin", "manager","affiliate"],
            guard: "protected",
            visible:true,
            element :<OfferAffiliate/>
          },
          {
            name : "Edit Offer",
            path : "/edit-affiliate-offer/:id",
            roles: ["admin", "manager","affiliate"],
            guard: "protected",
            visible:false,
            element :<EditOfferAffiliate/>
          },
          {
            name : "Add Offer",
            path : "/add-affiliate-offer",
            roles: ["admin", "manager","affiliate"],
            guard: "protected",
            visible:false,
            element :<AddOfferAffiliate/>
          }
          

        ]
      },
      {
        icon: <GalleryHorizontal {...icon} />,
        name: "Blogs",
        path: "/blogs",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Blogs",
            path: "/all-blogs",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:false,
             element:<BlogList />
          },
          {
            name: "Add Blog Form",
            path: "/add-blog",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <AddBlogForm />,
            visible: false,
          },
          {
            name: "Edit Blog Form",
            path: `/:id`,
            roles: ["admin", "manager"],
            guard: "protected",
            element: <EditBlogForm />,
            visible: false,
          },
          {
            name: "Blog Details",
            path: `/all-blogs/:id`,
            roles: ["admin", "manager"],
            guard: "protected",
            element: <BlogDetails />,
            visible: false,
          },
        ]
      },
      {
        icon: <Tickets {...icon} />,
        name: "Stores",
        path: "/stores",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Stores",
            path: "/all-stores",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <StoreList />
          },
          {
            name: "Add Stores",
            path: "/add-stores",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <AddStore/>,
            visible: false,
          },
          {
            name: "Edit Stores",
            path: "/edit/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <EditStore/>,
            visible: false,
          },
          {
            name: "Store Details",
            path: "/details/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:false,
            element :<StoreDetails/>
          },

          {
            name: "Featured Store",
            path: "/featured-stores",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
            element :<ManageStore/>
          },

          {
            name: "Brands",
            path: "/all-brands",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <BrandList />
          },

          {
            name: "Add Brands",
            path: "/add-brands",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <AddBrand/>,
            visible: false,
          },

          {
            name: "Edit Brands",
            path: "/edit-brand/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element : <EditBrand/>,
            visible: false,
          },

        ]
      },
       {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Network",
        path: "/network",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Networks",
            path: "/all-networks",
            roles: ["admin", "manager"],
            guard: "protected",
             element:<NetworkList />
          },
          {
            name: "Add Network",
            path: "/add-network",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <AddNetwork />,
            visible: false,
          },
          {
            name: "Edit Network",
            path: `/edit/:id`,
            roles: ["admin", "manager"],
            guard: "protected",
            element: <EditNetwork />,
            visible: false,
          },
          {
            name: "Network Details",
            path: `/details/:id`,
            roles: ["admin", "manager"],
            guard: "protected",
            element: <NetworkDetails />,
            visible: false,
          },
        ]
      },
      {
        icon: <NetworkIcon {...icon} />,
        name: "Ip WhiteList",
        path: "/ip-whitelist",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Ip List",
            path: "/all-ip",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
             element:<IpList />
          },
          {
            name: "Add Ip Form",
            path: "/add",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <AddIp/>,
            visible: false,
          },
          {
            name: "Edit Ip Form",
            path: "/edit/:id",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <EditIp />,
            visible: false,
          },
          // {
          //   name: "Blog Details",
          //   path: `/all-blogs/:id`,
          //   roles: ["admin", "manager"],
          //   guard: "protected",
          //   element: <BlogDetails />,
          //   visible: false,
          // },
        ]
      },
      {
        icon: <SendIcon {...icon} />,
        name: "Postback",
        path: "/postback",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "All Postbacks",
            path: "/all-postback",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
             element:<PostbackList/>
          },
          {
            name: "Add Postback",
            path: "/add",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <AddPostback/>,
            visible: false,
          },
          {
            name: "PostbackLog",
            path: "/postbacklog",
            roles: ["admin", "manager"],
            guard: "protected",
            element: <PostbackLogList />,
            visible: true,
          },
      
        ]
      },
      {
        icon: <Wallet2{...icon} />,
        name: "Wallet & Transactions",
        path: "/wallet",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "Wallet History",
            path: "/wallet-history",
            roles: ["admin", "manager"],
            guard: "protected",
            visible:true,
             element:<WalletHistory/>
          },
          // {
          //   name: "Withdraw History",
          //   path: "/withdraw-history",
          //   roles: ["admin", "manager"],
          //   guard: "protected",
          //   element: <WithdrawHistory/>,
          //   visible: true,
          // },
          // {
          //   name: "Edit Ip Form",
          //   path: "/edit/:id",
          //   roles: ["admin", "manager"],
          //   guard: "protected",
          //   element: <EditIp />,
          //   visible: false,
          // },
      
        ]
      },
      {

        icon: <TableCellsIcon {...icon} />,
        name: "users",
        path: "/users",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "Managers",
            path: "/managers",
            roles: ["admin"],
            guard: "private",
            element: <ManagerTable />,
          },
          {
            name: "Add Manager",
            path: "/add-manager",
            element: <AddManagerForm />,
            roles: ["admin"],
            guard: "private",
            visible: false
          },
          {
            name: "Add Manager",
            path: "/edit-user/:id",
            element: <EditManagerForm />,
            roles: ["admin"],
            guard: "private",
            visible: false
          },

        ]
      },
      {

        icon: <Settings2Icon {...icon} />,
        name: "Others",
        path: "/others",
        roles: ["admin", "manager"],
        guard: "protected",
        pages: [
          {
            name: "Category",
            path: "/category",
            roles: ["admin","manager"],
            guard: "protected",
            element: <CategoryList />,
          },

          {
            name: "Add Category",
            path: "/add-category",
            element: <AddCategory/>,
            roles: ["admin","manager"],
            guard: "protected",
            visible: false
          },
          {
            name: "Edit Category",
            path: "/category/:id",
            element: <EditCategory />,
            roles: ["admin","manager"],
            guard: "protected",
            visible: false
          },
          {
            name: "Push Notifications",
            path: "/push-notifications",
            roles: ["admin","manager"],
            guard: "protected",
            visible :true,
            element: <SendNotification />,
          },
          // {
          //   name: "Filter Group",
          //   path: "/filter-group",
          //   roles: ["admin","manager"],
          //   guard: "protected",
          //   element: <FilterGroupList />,
          // },
          // {
          //   name: "Add Category",
          //   path: "/add-filter-group",
          //   element: <AddFilterGroup/>,
          //   roles: ["admin","manager"],
          //   guard: "protected",
          //   visible: false
          // },
          // {
          //   name: "Edit Filter Group",
          //   path: "/filter-group/:id",
          //   element: <EditFilterGroup />,
          //   roles: ["admin","manager"],
          //   guard: "protected",
          //   visible: false
          // },

        ]
      },


    ],
  },
  {
    // title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
        visible: false,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
        visible: false,
      },
    ],
  },
];

export default routes;