import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Select,
  Option,
  Button,
  Checkbox,
  Chip
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { postbackService } from "@/api/services/postback.service";
import { networkService } from "@/api/services/network.service";
import { productService } from "@/api/services/product.service";
import { userService } from "@/api/services/user.service";

const usableTokens = [
  "{offer_id}", "{payout}", "{click_ip}", "{country}", "{aff_sub}","{aff_click}", "{source}", "{region}",
  "{city}", "{currency}", "{sale_amount}", "{conversion_ip}", "{operating_system}",
  "{browser_name}", "{browser_version}", "{useragent}", "{click_time}"
];

const AddPostback = () => {
  const navigate = useNavigate();

  const [affiliates, setAffiliates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    affiliate_id: "",
    offer_id: "",
    event: "",
    postback: "",
    status: 1,
    isGlobal: false,
  });
  const [loading, setLoading] = useState(false);
  const DemoPostbackUrl = `
              https://example.com/postback?click_id={aff_sub5}&aff_id={aff_sub}&offer_id={offer_id}&goal_id={goal_id} `

  // Fetch affiliates (networks)
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await networkService.list();

        //console.log("this is networks",res);
        setAffiliates(res.data?.data?.networks || []);
       // console.log("this is networks",affiliates);
        
      } catch (error) {
        console.log("failed to fetch networks",error);
        
        toast.error("Failed to load  networks");
      }
    };
    fetchNetworks();
   //fetchAffiliates();
  }, []);

  // const fetchAffiliates = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await userService.list({
  //         role: 'affiliate',
  //         status: 'active',
  //         limit: 1000,
  //       });
  //       const affiliateData = res.data?.data?.users || [];
  //       console.log("this is ffiliate data",affiliateData);
        
  //       setAffiliates(affiliateData); 
  //     } catch (error) {
  //       console.error('Failed to fetch affiliates:', error);
  //       toast.error('Failed to load affiliates');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // Fetch offers (products)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await productService.list();
        const products = res.data?.data.products || [];
        setOffers(products);
      } catch (error) {
        toast.error("Failed to load offers");
      }
    };
    fetchOffers();
  }, []);

  // When offer changes, populate events from product.goals
  useEffect(() => {
    if (!form.offer_id || form.isGlobal) {
      setEvents([]);
      handleChange("event", "");
      return;
    }

    const selectedOffer = offers.find((offer) => offer._id === form.offer_id);

    if (selectedOffer && selectedOffer.goals && selectedOffer.goals.length > 0) {
      const goalsList = selectedOffer.goals.map((g) => ({
        name: g.name || g.goalId,
        id: g.goalId,
      }));

      setEvents(goalsList);

      // Auto-select goal if only one
      if (goalsList.length === 1) {
        handleChange("event", goalsList[0].name);
      } else {
        handleChange("event", "");
      }
    } else {
      setEvents([]);
      handleChange("event", "");
    }
  }, [form.offer_id, form.isGlobal, offers]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear offer and event when isGlobal is toggled on
    if (field === "isGlobal" && value === true) {
      setForm((prev) => ({ 
        ...prev, 
        [field]: value,
        offer_id: "",
        event: ""
      }));
      setEvents([]);
    }
  };

  const handleSubmit = async () => {
    // Validation based on global checkbox
    if (form.isGlobal) {
      if (!form.affiliate_id || !form.postback) {
        toast.error("Please fill affiliate and postback fields");
        return;
      }
    } else {
      if (!form.affiliate_id || !form.offer_id || !form.event || !form.postback) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    setLoading(true);
    try {
      let payload = {
        network: form.affiliate_id,
        postback: form.postback,
        status: 'success',
      };

      // Only include offer_id and event if not global
      if (!form.isGlobal) {
        payload.offer_id = form.offer_id;
        payload.event = form.event;
      }

      await postbackService.create(payload);
      toast.success("Postback added successfully");
      navigate(-1);
    } catch (error) {
      console.log("this is error",error);
      
      toast.error("Failed to add postback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 mb-8 flex justify-center">
      <Card className="w-full max-w-7xl shadow-md border border-gray-100">
        <CardHeader
          variant="gradient"
          color="blue"
          className="p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Add Postback
          </Typography>
        </CardHeader>

        <CardBody className="space-y-6 p-6">
          {/* Affiliate */}
          <div>
            <Typography variant="small" className="mb-1 font-medium text-gray-700">
              Network <span className="text-red-500">*</span>
            </Typography>
            <Select
              key={form.affiliate_id}
              label="Select Network"
              value={form.affiliate_id}
              onChange={(val) => handleChange("affiliate_id", val)}
             
            >
              {affiliates.map((aff) => (
                <Option key={aff._id} value={aff._id}>
                  {aff.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Global Postback Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.isGlobal}
              onChange={(e) => handleChange("isGlobal", e.target.checked)}
              color="blue"
            />
            <Typography variant="small" className="font-medium text-gray-700">
              Global Postback
            </Typography>
          </div>

          {/* Offer - Hide when global */}
          {!form.isGlobal && (
            <div>
              <Typography variant="small" className="mb-1 font-medium text-gray-700">
                Offer <span className="text-red-500">*</span>
              </Typography>
              <Select
                 key={form.offer_id}
                label="Select Offer"
                value={form.offer_id}
                onChange={(val) => handleChange("offer_id", val)}
              >
                {offers.map((offer) => (
                  <Option key={offer._id} value={offer._id}>
                    {offer.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Event - Hide when global */}
          {!form.isGlobal && (
            <div>
              <Typography variant="small" className="mb-1 font-medium text-gray-700">
                Event <span className="text-red-500">*</span>
              </Typography>
              <Select
                key={form.event}
                label="Select Event"
                value={form.event}
                onChange={(val) => handleChange("event", val)}
              >
                {events.length > 0 ? (
                  events.map((evt) => (
                    <Option key={evt.id} value={evt.name}>
                      {evt.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>
                    {form.offer_id ? "No goals found for this offer" : "Select an offer first"}
                  </Option>
                )}
              </Select>
            </div>
          )}

          {/* Pixel/Postback */}
          <div>
            <Typography variant="small" className="mb-1 font-medium text-gray-700">
              Pixel/Postback <span className="text-red-500">*</span>
            </Typography>
            <Input
              label="Pixel / Postback Code"
              value={form.postback}
              onChange={(e) => handleChange("postback", e.target.value)}
            />
          </div>



          {/* Example + Usable Tokens */}
          <div className="border-t pt-4 mt-4">
            <Typography variant="small" className="text-gray-700 font-medium mb-2">
              Example Postback
            </Typography>
            <Typography variant="small" className="text-pink-500 font-mono break-all"> {DemoPostbackUrl}
            </Typography>

            <Typography variant="small" className="text-gray-700 mt-3 mb-2 font-medium">
              Usable URL tokens
            </Typography>
            <div className="flex flex-wrap gap-2">
              {usableTokens.map((token, i) => (
                <Chip
                  key={i}
                  variant="ghost"
                  color="blue-gray"
                  size="sm"
                  value={token}
                  className="cursor-default text-sm font-mono"
                />
              ))}
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex justify-end gap-3 border-t p-6">
          <Button
            variant="text"
            color="gray"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? "Adding..." : "Add Postback"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddPostback;