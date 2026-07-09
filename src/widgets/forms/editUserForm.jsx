import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Checkbox,
  Typography,
  Button,
} from "@material-tailwind/react";
import { X } from "lucide-react";

export const EditUserDialog=({ 
  open, 
  onClose, 
  user, 
  onSave, 
  onChange 
})=> {
  // Guard against null user
  if (!user) return null;

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
    >
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h5">Edit User</Typography>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </DialogHeader>
      <DialogBody className="overflow-y-auto max-h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              User ID (Read Only)
            </Typography>
            <Input 
              size="md" 
              value={user.userId}
              disabled
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            />
          </div>
          
          <div className="col-span-2">
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Email
            </Typography> */}
            <Input 
              size="md" 
              value={user.email}
              label="Email"
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Referral Percentage
            </Typography> */}
            <Input 
              size="md" 
              type="number"
              label="Referral Percentage"
              value={user.referralPercent}
              onChange={(e) => handleFieldChange('referralPercent', Number(e.target.value))}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Gender
            </Typography> */}
            <Select
            label="Gender"
              value={user.gender}
              onChange={(value) => handleFieldChange('gender', value)}
              className=""
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Created At
            </Typography> */}
            <Input 
              label="Created At"
              size="md" 
              type="date"
              value={user.createdAt}
              onChange={(e) => handleFieldChange('createdAt', e.target.value)}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Status
            </Typography> */}
            <Select
            label="Status"
              value={user.banned ? "Banned" : "Active"}
              onChange={(value) => handleFieldChange('banned', value === "Banned")}
              className=""
            >
              <Option value="Active">Active</Option>
              <Option value="Banned">Banned</Option>
            </Select>
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Cash Back
            </Typography> */}
            <Input 
              size="md" 
              label="Cash Back"
              type="number"
              step="0.01"
              value={user.cashBack}
              onChange={(e) => handleFieldChange('cashBack', Number(e.target.value))}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Reward
            </Typography> */}
            <Input 
              size="md" 
              label="Reward"
              type="number"
              step="0.01"
              value={user.reward}
              onChange={(e) => handleFieldChange('reward', Number(e.target.value))}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Payable
            </Typography> */}
            <Input 
              size="md" 
              type="number"
              label="Payable"
              step="0.01"
              value={user.payable}
              onChange={(e) => handleFieldChange('payable', Number(e.target.value))}
              className=""
            />
          </div>
          
          <div>
            {/* <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Paid
            </Typography> */}
            <Input 
              size="md" 
              label="Paid"
              type="number"
              step="0.01"
              value={user.paid}
              onChange={(e) => handleFieldChange('paid', Number(e.target.value))}
              className=""
            />
          </div>
          
          <div className="col-span-2 flex items-center gap-3">
            <Checkbox 
              checked={user.canShareEarn}
              onChange={(e) => handleFieldChange('canShareEarn', e.target.checked)}
            />
            <Typography color="blue-gray" className="font-medium">
              Can Share Earn
            </Typography>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-center gap-2">
        <Button
          variant="outlined"
          color="blue-gray"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="gradient"
          color="blue"
          onClick={onSave}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default EditUserDialog;