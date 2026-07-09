import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Checkbox,
  Textarea,
} from "@material-tailwind/react";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { productService } from "@/api/services/product.service";
import { goalsService } from "@/api/services/goals.service";

const AssignGoalsForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productId: "",
    goals: [
      {
        goalId: "",
        goalName: "",
        goalDescription: "",
        goalModel: "CPA",
        currency: "USD",
        revenue: "",
        payout: "",
        isBillable: true,
        isHold: false,
      },
    ],
  });

  const [products, setProducts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const goalModels = ["CPC", "CPA", "CPS", "CPL", "other"];
  const currencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

  // Fetch products and goals on component mount
  useEffect(() => {
    fetchProducts();
    fetchGoals();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.list(1, { limit: 100 });
      const productData = res.data?.data?.products || [];
      setProducts(productData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchGoals = async () => {
    setLoadingGoals(true);
    try {
      const res = await goalsService.list(1, { limit: 100 });
      console.log("this is res", res);
      const goalData = res.data?.data?.goals || [];
      setGoals(goalData);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleProductChange = (value) => {
    setForm({ ...form, productId: value });
  };

  const handleGoalChange = (index, field, value) => {
    const updated = [...form.goals];
    updated[index][field] = value;

    // Auto-fill goal name and description when goalId changes
    if (field === "goalId") {
      const selectedGoal = goals.find((g) => g._id === value);
      if (selectedGoal) {
        updated[index].goalName = selectedGoal.name || "";
        updated[index].goalDescription = selectedGoal.description || "";
      }
    }

    setForm({ ...form, goals: updated });
  };

  const handleCheckboxChange = (index, field) => {
    const updated = [...form.goals];
    updated[index][field] = !updated[index][field];
    setForm({ ...form, goals: updated });
  };

  const addGoal = () => {
    setForm({
      ...form,
      goals: [
        ...form.goals,
        {
          goalId: "",
          goalName: "",
          goalDescription: "",
          goalModel: "CPA",
          currency: "USD",
          revenue: "",
          payout: "",
          isBillable: true,
          isHold: false,
        },
      ],
    });
  };

  const removeGoal = (index) => {
    const updated = [...form.goals];
    updated.splice(index, 1);
    setForm({ ...form, goals: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.productId) {
      toast.error("Please select a product");
      return;
    }

    for (let i = 0; i < form.goals.length; i++) {
      const goal = form.goals[i];
      if (!goal.goalId) {
        toast.error(`Please select a goal for item ${i + 1}`);
        return;
      }
      if (!goal.revenue || !goal.payout) {
        toast.error(`Please enter revenue and payout for item ${i + 1}`);
        return;
      }
    }

    try {
      // Format payload
      const payload = {
        productId: form.productId,
        goals: form.goals.map((goal) => ({
          goalId: goal.goalId,
          goalModel: goal.goalModel,
          currency: goal.currency,
          revenue: parseFloat(goal.revenue),
          payout: parseFloat(goal.payout),
          isBillable: goal.isBillable,
          isHold: goal.isHold,
        })),
      };

      console.log("Submitting payload:", payload);

      const res = await productService.assignGoals(payload);
      toast.success(res.data.message || "Goals assigned successfully!");

      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign goals");
    }
  };

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="text" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">
            Assign Goals to Product
          </Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="grid gap-6 p-6 bg-white">
          {/* Product Selection */}
          <div className="grid md:grid-cols-1 gap-6">
            <Select
              label={loadingProducts ? "Loading Products..." : "Select Product"}
              value={form.productId}
              onChange={handleProductChange}
              disabled={loadingProducts}
              selected={(element) => {
                const selectedProduct = products.find((p) => p._id === form.productId);
                return selectedProduct ? selectedProduct.name : "";
              }}
            >
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Goals Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Typography variant="h6">Goals</Typography>
              <Button color="blue" size="sm" onClick={addGoal} className="flex items-center gap-2">
                <Plus size={16} />
                Add Goal
              </Button>
            </div>

            {form.goals.map((goal, idx) => (
              <Card key={idx} className="p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" color="blue-gray">
                    Goal {idx + 1}
                  </Typography>
                  <Button
                    color="red"
                    size="sm"
                    onClick={() => removeGoal(idx)}
                    disabled={form.goals.length === 1}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4">
                  {/* Goal Selection */}
                  <Select
                    label={loadingGoals ? "Loading Goals..." : "Select Goal"}
                    value={goal.goalId}
                    onChange={(val) => handleGoalChange(idx, "goalId", val)}
                    disabled={loadingGoals}
                    selected={(element) => {
                      const selectedGoal = goals.find((g) => g._id === goal.goalId);
                      return selectedGoal ? selectedGoal.name : "";
                    }}
                  >
                    {goals.map((g) => (
                      <Option key={g._id} value={g._id}>
                        {g.name}
                      </Option>
                    ))}
                  </Select>

                  {/* Goal Name (Auto-filled, Read-only) */}
                  <Input
                    label="Goal Name"
                    value={goal.goalName}
                    disabled
                    className="bg-gray-50"
                  />

                  {/* Goal Description (Auto-filled, Read-only) */}
                  <Textarea
                    label="Goal Description"
                    value={goal.goalDescription}
                    disabled
                    className="bg-gray-50"
                    rows={3}
                  />

                  {/* Goal Model and Currency */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Select
                      label="Goal Model"
                      value={goal.goalModel}
                      onChange={(val) => handleGoalChange(idx, "goalModel", val)}
                    >
                      {goalModels.map((model) => (
                        <Option key={model} value={model}>
                          {model}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      label="Currency"
                      value={goal.currency}
                      onChange={(val) => handleGoalChange(idx, "currency", val)}
                    >
                      {currencies.map((curr) => (
                        <Option key={curr} value={curr}>
                          {curr}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Revenue and Payout */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Revenue"
                      type="number"
                      step="0.01"
                      min="0"
                      value={goal.revenue}
                      onChange={(e) => handleGoalChange(idx, "revenue", e.target.value)}
                      required
                    />
                    <Input
                      label="Payout"
                      type="number"
                      step="0.01"
                      min="0"
                      value={goal.payout}
                      onChange={(e) => handleGoalChange(idx, "payout", e.target.value)}
                      required
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <Checkbox
                      label="Is Billable"
                      checked={goal.isBillable}
                      onChange={() => handleCheckboxChange(idx, "isBillable")}
                    />
                    <Checkbox
                      label="Is Hold"
                      checked={goal.isHold}
                      onChange={() => handleCheckboxChange(idx, "isHold")}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" color="blue" size="lg">
            Assign Goals
          </Button>
        </CardBody>
      </form>
    </Card>
  );
};

export default AssignGoalsForm;