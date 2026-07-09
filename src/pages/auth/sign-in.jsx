import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./authContext";
import { useApi } from "@/hooks/useApi";
import { authService } from "@/api/services/auth.service";

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const {
    data: loginData,
    loading,
    call: loginUser,
  } = useApi(authService.login);

  // Log only when loginData changes
  // useEffect(() => {
  //   if (loginData) {
  //   //  console.log("LoginData updated:", loginData);
  //   }
  // }, [loginData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(form); // pass form data
      const user = result?.data?.user;
      const token = result?.data?.accessToken;

      if (user && token) {
                if (user.status !== "active") {
          toast.error("You are not permitted to log in");
          return;
        }
        login(user ,token);
      //  console.log("token stored ");
        
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (err) {
      console.log("login error",err);
      
      toast.error(`${err.response?.data?.message} |Login failed!`);
    }
  };

  return (
    <section className=" flex  flex-col-reverse lg:flex-row ">
      <div className="w-full p-2 min-h-screen content-center   ">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your email and password to sign in.
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className=" m-4 mx-auto w-full max-w-lg">
          <div className="mb-6">
            <Typography variant="small" className="mb-2 font-medium">
              Your Email
            </Typography>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              size="lg"
              label="abc@xyz.com"
              required
            />
          </div>
          <div className="mb-4">
            <Typography variant="small" className="mb-2 font-medium">
              Password
            </Typography>
            <Input                      
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              size="lg"
              label="Password"
              required
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            {/* <Checkbox
              label={
                <Typography variant="small" color="gray">
                  Remember me
                </Typography>
              }
            />
            <Typography
              variant="small"
              className="text-gray-900 cursor-pointer hover:underline"
            >
              Forgot Password?
            </Typography> */}
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div> 

      <div className="  w-full min-h-screen hidden content-center lg:block">
        <img
          src="/img/gadgets.png"
          className=" rounded-3xl shadow-md  object-cover "
          alt="pattern"
        />
      </div>
    </section>
  );
}

export default SignIn;
